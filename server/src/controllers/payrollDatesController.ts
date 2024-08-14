import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type PayrollDate } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param payrollDate - Payroll date object
 * @returns - Payroll date object with parsed values
 */
const payrollDatesParse = (
    payrollDate: Record<string, string>,
): PayrollDate => ({
    id: parseInt(payrollDate.payroll_date_id),
    jobId: parseInt(payrollDate.job_id),
    payrollDay: parseInt(payrollDate.payroll_day),
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payroll dates
 */
export const getPayrollDates = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { jobId, id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && jobId) {
            query = payrollQueries.getPayrollDatesByIdAndJobId;
            params = [id, jobId];
        } else if (id) {
            query = payrollQueries.getPayrollDatesById;
            params = [id];
        } else if (jobId) {
            query = payrollQueries.getPayrollDatesByJobId;
            params = [jobId];
        } else {
            query = payrollQueries.getAllPayrollDates;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = rows.map((row) =>
            payrollDatesParse(row),
        );

        response.status(200).json(payrollDates);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'payroll date'
                    : jobId
                    ? 'payroll dates for given job id'
                    : 'payroll dates'
            }`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to toggle a payroll date
 */
export const togglePayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { jobId, payrollDay } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollDateByJobIdAndPayrollDay,
            [jobId, payrollDay],
        );

        await client.query('BEGIN;');

        if (rows.length > 0) {
            await client.query(payrollQueries.deletePayrollDate, [
                rows[0].payroll_date_id,
            ]);
        } else {
            await client.query(payrollQueries.createPayrollDate, [
                jobId,
                payrollDay,
            ]);

            await client.query('SELECT process_payroll_for_job($1)', [jobId]);
        }

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting, creating, or updating payroll dates for the day of ${payrollDay} of job id of ${jobId}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

export const togglePayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    try {
        response.status(201).json('Payroll date toggled');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error toggling payroll date');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to create a new payroll date
 */
export const createPayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { jobId, payrollDay } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(payrollQueries.createPayrollDate, [
            jobId,
            payrollDay,
        ]);

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = rows.map((row) =>
            payrollDatesParse(row),
        );

        request.payrollDateId = payrollDates[0].id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

export const createPayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { payrollDateId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollDatesById,
            [payrollDateId],
        );

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = rows.map((row) =>
            payrollDatesParse(row),
        );

        response.status(201).json(payrollDates);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update a payroll date
 */
export const updatePayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;
    const { jobId, payrollDay } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollDatesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(payrollQueries.updatePayrollDate, [
            jobId,
            payrollDay,
            id,
        ]);

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a payroll date
 */
export const updatePayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollDatesById,
            [id],
        );

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = rows.map((row) =>
            payrollDatesParse(row),
        );

        response.status(200).json(payrollDates);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a DELETE request to the database to delete a payroll date
 */
export const deletePayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollDatesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(payrollQueries.deletePayrollDate, [id]);

        await client.query('SELECT process_payroll_for_job($1)', [
            rows[0].job_id,
        ]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a payroll date
 */
export const deletePayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Successfully deleted payroll date');
};
