import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { JobSchedule, type Job } from '../types/types.js';
import { logger } from '../config/winston.js';
import { QueryResult } from 'pg';

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
    const { job_id } = request.query;

    try {
        const query: string = job_id
            ? payrollQueries.getJobsWithSchedulesByJobId
            : payrollQueries.getAllJobsWithSchedules;
        const params: any[] = job_id ? [job_id] : [];

        const results = await executeQuery(query, params);

        if (job_id && results.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        // // Parse the data to the correct format and return an object
        const jobs: Job[] = results.map((job) => jobsParse(job));

        response.status(200).json(jobs);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting ${job_id ? 'job' : 'jobs'}`);
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
    try {
        const {
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_schedule,
        } = request.body;

        // First, create the job and get its ID
        const jobResult = await executeQuery(payrollQueries.createJob, [
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
        ]);
        const jobId = jobResult[0].job_id;

        // Then, create schedules for this job
        const schedulePromises = job_schedule.map((js: JobSchedule) =>
            executeQuery(payrollQueries.createJobSchedule, [
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
            job_id: jobId,
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_schedule: job_schedule.map((schedule: JobSchedule) => ({
                ...schedule,
                job_id: jobId, // Ensure all schedules in the response contain the new job's ID
            })),
        };

        await executeQuery('SELECT process_payroll_for_job($1)', [jobId]);

        // Parse the data to correct format and return an object
        const jobs = jobsParse(responseObject);

        response.status(201).json(jobs);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating job');
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

        const results = await executeQuery(payrollQueries.updateJob, [
            account_id,
            name,
            hourly_rate,
            vacation_days,
            sick_days,
            job_id,
        ]);

        if (results.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        const schedulePromises = job_schedule.map((js: JobSchedule) =>
            executeQuery(payrollQueries.updateJobSchedule, [
                js.day_of_week,
                js.start_time,
                js.end_time,
                job_id,
            ]),
        );

        // Wait for all schedule creation promises to resolve
        await Promise.all(schedulePromises);

        await executeQuery('SELECT process_payroll_for_job($1)', [job_id]);

        request.job_id = results[0].id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
    }
};

export const updateJobReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { job_id } = request;

    try {
        const results = await executeQuery(payrollQueries.getJob, [job_id]);

        // Parse the data to correct format and return an object
        const jobs: Job[] = results.map((job) => jobsParse(job));

        response.status(200).json(jobs);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
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
    try {
        const job_id = parseInt(request.params.job_id);

        const transferResults = await executeQuery(payrollQueries.getJob, [
            job_id,
        ]);

        if (transferResults.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await executeQuery(payrollQueries.deleteJob, [job_id]);

        await executeQuery('SELECT process_payroll_for_job($1)', [job_id]);

        response.status(200).send('Successfully deleted job');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting job');
    }
};
