import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type Job } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param job - Job object
 * @returns - Employee object with correct data types
 */
const jobsParse = (jobs: Record<string, string>): Job => ({
    id: parseInt(jobs.employee_id),
    name: jobs.job_name,
    hourly_rate: parseFloat(jobs.hourly_rate),
    regular_hours: parseInt(jobs.regular_hours),
    vacation_days: parseInt(jobs.vacation_days),
    sick_days: parseInt(jobs.sick_days),
    work_schedule: jobs.work_schedule,
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
            ? payrollQueries.getJob
            : payrollQueries.getJobs;
        const params: any[] = job_id ? [job_id] : [];

        const results = await executeQuery(query, params);

        if (job_id && results.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        // Parse the data to the correct format and return an object
        const jobs: Job[] = results.map((employee) => jobsParse(employee));

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
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
        } = request.body;

        const results = await executeQuery(payrollQueries.createJob, [
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
        ]);

        // Parse the data to correct format and return an object
        const jobs: Job[] = results.map((job) => jobsParse(job));

        response.status(201).json(jobs);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating employee');
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
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
        } = request.body;

        const results = await executeQuery(payrollQueries.updateJob, [
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
            job_id,
        ]);

        if (results.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await executeQuery('SELECT process_payroll_for_job($1)', [1]);

        // Parse the data to correct format and return an object
        const jobs: Job[] = results.map((job) => jobsParse(job));

        request.job_id = jobs[0].id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
    }
};

export const updateEmployeeReturnObject = async (
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
 * Sends a DELETE request to the database to delete an employee
 */
export const deleteEmployee = async (
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

        const payrollDatesResults = await executeQuery(
            payrollQueries.getPayrollDatesByJobId,
            [job_id],
        );
        const hasPayrollDates: boolean = payrollDatesResults.length > 0;

        const payrollTaxesResults = await executeQuery(
            payrollQueries.getPayrollTaxesByJobId,
            [job_id],
        );
        const hasPayrollTaxes: boolean = payrollTaxesResults.length > 0;

        if (hasPayrollDates || hasPayrollTaxes) {
            response.status(400).send({
                errors: {
                    msg: 'You need to delete job-related data before deleting the job',
                    param: null,
                    location: 'query',
                },
            });
            return;
        }

        await executeQuery(payrollQueries.deleteJob, [job_id]);

        await executeQuery('SELECT process_payroll_for_job($1)', [1]);

        response.status(200).send('Successfully deleted job');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting job');
    }
};
