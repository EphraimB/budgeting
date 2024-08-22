import { type NextFunction, type Request, type Response } from 'express';
import { handleError } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

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
    const { jobId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (jobId) {
            query = `
                SELECT *
                    FROM payroll_dates
                    WHERE job_id = $1;
            `;
            params = [jobId];
        } else {
            query = `
                SELECT *
                    FROM payroll_dates;
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payroll dates');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payroll dates
 */
export const getPayrollDatesById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { jobId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (jobId) {
            query = `
                SELECT *
                    FROM payroll_dates
                    WHERE id = $1 AND job_id = $2
            `;
            params = [id, jobId];
        } else {
            query = `
                SELECT *
                FROM payroll_dates
                WHERE id = $1
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting payroll dates for job id of ${id}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to toggle a payroll date
 */
export const togglePayrollDate = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { jobId, payrollDay } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM payroll_dates
                    WHERE job_id = $1 AND payroll_day = $2
            `,
            [jobId, payrollDay],
        );

        await client.query('BEGIN;');

        if (rows.length > 0) {
            await client.query(
                `
                    DELETE FROM payroll_dates
                        WHERE id = $1
                `,
                [rows[0].id],
            );
        } else {
            await client.query(
                `
                    INSERT INTO payroll_dates
                        (job_id, payroll_day)
                        VALUES ($1, $2)
                `,
                [jobId, payrollDay],
            );

            await client.query('SELECT process_payroll_for_job($1)', [jobId]);
        }

        await client.query('COMMIT;');

        response.status(201).json('Payroll date toggled');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error toggling payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new payroll date
 */
export const createPayrollDate = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { jobId, payrollDay } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(
            `
                INSERT INTO payroll_dates
                    (job_id, payroll_day)
                    VALUES ($1, $2)
                    RETURNING *
            `,
            [jobId, payrollDay],
        );

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        response.status(201).json(rows);
    } catch (error) {
        await client.query('ROLLBACK;');

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
 * Sends a PUT request to the database to update a payroll date
 */
export const updatePayrollDate = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { jobId, payrollDay } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM payroll_dates
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await client.query('BEGIN;');

        const { rows: updatePayrollDateResults } = await client.query(
            `
                UPDATE payroll_dates
                    SET job_id = $1,
                    payroll_day = $2
                    WHERE id = $3
                    RETURNING *
            `,
            [jobId, payrollDay, id],
        );

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        response.status(200).json(updatePayrollDateResults);
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
 * Sends a DELETE request to the database to delete a payroll date
 */
export const deletePayrollDate = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, job_id
                    FROM payroll_dates
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM payroll_dates
                    WHERE id = $1
            `,
            [id],
        );

        await client.query('SELECT process_payroll_for_job($1)', [
            rows[0].job_id,
        ]);

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted payroll date');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll date');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
