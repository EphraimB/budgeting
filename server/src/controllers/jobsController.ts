import { type NextFunction, type Request, type Response } from 'express';
import { jobQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { JobSchedule, type Job } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param job - Job object
 * @returns - Job object with correct data types
 */
const jobsParse = (jobs: Record<string, any>): Job => ({
    id: parseInt(jobs.job_id),
    accountId: parseInt(jobs.account_id),
    name: jobs.job_name,
    hourlyRate: parseFloat(jobs.hourly_rate),
    vacationDays: parseInt(jobs.vacation_days),
    sickDays: parseInt(jobs.sick_days),
    totalHoursPerWeek: parseFloat(jobs.total_hours_per_week),
    jobSchedule: jobs.job_schedule.map((schedule: Record<string, any>) => ({
        dayOfWeek: parseInt(schedule.day_of_week),
        startTime: schedule.start_time,
        endTime: schedule.end_time,
    })),
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all jobs
 */
export const getJobs = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId, id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && accountId) {
            query = jobQueries.getJobsWithSchedulesByJobIdAndAccountId;
            params = [id, accountId];
        } else if (id) {
            query = jobQueries.getJobsWithSchedulesByJobId;
            params = [id];
        } else if (accountId) {
            query = jobQueries.getJobsWithSchedulesByAccountId;
            params = [accountId];
        } else {
            query = jobQueries.getAllJobsWithSchedules;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        // Parse the data to the correct format and return an object
        const jobs: Job[] = rows.map((row) => jobsParse(row));

        response.status(200).json(jobs);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'job' : 'jobs'}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new job
 */
export const createJob = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const {
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
            jobSchedule,
        } = request.body;

        await client.query('BEGIN;');

        // First, create the job and get its ID
        const { rows } = await client.query(jobQueries.createJob, [
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
        ]);
        const jobId = rows[0].job_id;

        // Then, create schedules for this job
        const schedulePromises = jobSchedule.map(
            async (js: JobSchedule) =>
                await client.query(jobQueries.createJobSchedule, [
                    jobId,
                    js.dayOfWeek,
                    js.startTime,
                    js.endTime,
                ]),
        );

        // Wait for all schedule creation promises to resolve
        await Promise.all(schedulePromises);

        // Create the response object
        const responseObject = {
            id: jobId,
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
            job_schedule: jobSchedule.map((schedule: JobSchedule) => ({
                ...schedule,
            })),
        };

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        response.status(201).json(responseObject);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating job');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update an job
 */
export const updateJob = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const jobId = parseInt(request.params.jobId);
        const {
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
            jobSchedule,
        } = request.body;

        const { rows } = await client.query(jobQueries.getJob, [jobId]);

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(jobQueries.updateJob, [
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
            jobId,
        ]);

        // Fetch existing schedules for the job
        const { rows: existingSchedules } = await client.query(
            jobQueries.getJobScheduleByJobId,
            [jobId],
        );

        // Set to track IDs of schedules that are still present
        const updatedOrAddedScheduleIds = new Set();

        for (const js of jobSchedule) {
            const existingSchedule = existingSchedules.find(
                (s) =>
                    s.day_of_week === js.dayOfWeek &&
                    s.start_time === js.startTime &&
                    s.end_time === js.endTime,
            );

            if (existingSchedule) {
                // Update the existing schedule
                await client.query(jobQueries.updateJobSchedule, [
                    js.dayOfWeek,
                    js.startTime,
                    js.endTime,
                    existingSchedule.job_schedule_id,
                ]);
                updatedOrAddedScheduleIds.add(existingSchedule.job_schedule_id);
            } else {
                // Insert a new schedule
                const { rows: result } = await client.query(
                    jobQueries.createJobSchedule,
                    [jobId, js.dayOfWeek, js.startTime, js.endTime],
                );
                // Assuming the result includes the ID of the inserted schedule
                updatedOrAddedScheduleIds.add(result[0].job_id);
            }
        }

        // Delete schedules that were not in the updatedOrAddedScheduleIds set
        const schedulesToDelete = existingSchedules.filter(
            (s) => !updatedOrAddedScheduleIds.has(s.job_schedule_id),
        );

        for (const schedule of schedulesToDelete) {
            await client.query(jobQueries.deleteJobScheduleByJobId, [
                schedule.job_schedule_id,
            ]);
        }

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        request.jobId = jobId;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

export const updateJobReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { jobId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            jobQueries.getJobsWithSchedulesByJobId,
            [jobId],
        );

        await client.query('COMMIT;');

        // Parse the data to correct format and return an object
        const jobs: Job[] = rows.map((row) => jobsParse(row));

        response.status(200).json(jobs);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete an job
 */
export const deleteJob = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const jobId = parseInt(request.params.jobId);

        const { rows } = await client.query(jobQueries.getJob, [jobId]);

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(jobQueries.deleteJob, [jobId]);

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted job');
    } catch (error) {
        await client.query('ROLLBACK');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting job');
    }
};
