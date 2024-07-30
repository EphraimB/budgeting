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
    account_id: parseInt(jobs.account_id),
    name: jobs.job_name,
    hourly_rate: parseFloat(jobs.hourly_rate),
    vacation_days: parseInt(jobs.vacation_days),
    sick_days: parseInt(jobs.sick_days),
    total_hours_per_week: parseFloat(jobs.total_hours_per_week),
    job_schedule: jobs.job_schedule.map((schedule: Record<string, any>) => ({
        day_of_week: parseInt(schedule.day_of_week),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
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
    const { account_id, id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && account_id) {
            query = jobQueries.getJobsWithSchedulesByJobIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = jobQueries.getJobsWithSchedulesByJobId;
            params = [id];
        } else if (account_id) {
            query = jobQueries.getJobsWithSchedulesByAccountId;
            params = [account_id];
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
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_schedule,
        } = request.body;

        await client.query('BEGIN;');

        // First, create the job and get its ID
        const { rows } = await client.query(jobQueries.createJob, [
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
        ]);
        const jobId = rows[0].job_id;

        // Then, create schedules for this job
        const schedulePromises = job_schedule.map((js: JobSchedule) =>
            client.query(jobQueries.createJobSchedule, [
                jobId,
                js.day_of_week,
                js.start_time,
                js.end_time,
            ]),
        );

        // Wait for all schedule creation promises to resolve
        await Promise.all(schedulePromises);

        // Create the response object
        const responseObject = {
            id: jobId,
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_schedule: job_schedule.map((schedule: JobSchedule) => ({
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
        const job_id = parseInt(request.params.job_id);
        const {
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_schedule,
        } = request.body;

        const { rows } = await client.query(jobQueries.getJob, [job_id]);

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(jobQueries.updateJob, [
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_id,
        ]);

        // Fetch existing schedules for the job
        const { rows: existingSchedules } = await client.query(
            jobQueries.getJobScheduleByJobId,
            [job_id],
        );

        // Set to track IDs of schedules that are still present
        const updatedOrAddedScheduleIds = new Set();

        for (const js of job_schedule) {
            const existingSchedule = existingSchedules.find(
                (s) =>
                    s.day_of_week === js.day_of_week &&
                    s.start_time === js.start_time &&
                    s.end_time === js.end_time,
            );

            if (existingSchedule) {
                // Update the existing schedule
                await client.query(jobQueries.updateJobSchedule, [
                    js.day_of_week,
                    js.start_time,
                    js.end_time,
                    existingSchedule.job_schedule_id,
                ]);
                updatedOrAddedScheduleIds.add(existingSchedule.job_schedule_id);
            } else {
                // Insert a new schedule
                const { rows: result } = await client.query(
                    jobQueries.createJobSchedule,
                    [job_id, js.day_of_week, js.start_time, js.end_time],
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

        await client.query('SELECT process_payroll_for_job($1)', [job_id]);

        await client.query('COMMIT;');

        request.job_id = job_id;

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
    const { job_id } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            jobQueries.getJobsWithSchedulesByJobId,
            [job_id],
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
        const job_id = parseInt(request.params.job_id);

        const { rows } = await client.query(jobQueries.getJob, [job_id]);

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(jobQueries.deleteJob, [job_id]);

        await client.query('SELECT process_payroll_for_job($1)', [job_id]);

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted job');
    } catch (error) {
        await client.query('ROLLBACK');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting job');
    }
};
