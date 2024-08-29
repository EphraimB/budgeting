import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payroll taxes
 */
export const getPayrollTaxes = async (
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
                    FROM payroll_taxes
                    WHERE job_id = $1
            `;
            params = [jobId];
        } else {
            query = `
                SELECT *
                    FROM payroll_taxes
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting payroll taxes`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to a single payroll tax
 */
export const getPayrollTaxesById = async (
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
                    FROM payroll_taxes
                    WHERE id = $1 AND job_id = $2
            `;
            params = [id, jobId];
        } else {
            query = `
                SELECT *
                    FROM payroll_taxes
                    WHERE id = $1
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const retreivedRow = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRow[0]);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting payroll taxes for job id of ${id}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a payroll tax
 */
export const createPayrollTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { jobId, name, rate } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(
            `
                INSERT INTO payroll_taxes
                    (job_id, name, rate)
                    VALUES ($1, $2, $3)
                    RETURNING *
            `,
            [jobId, name, rate],
        );

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a payroll tax
 */
export const updatePayrollTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { name, rate } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM payroll_taxes
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        await client.query('BEGIN;');

        const { rows: updatePayrollTaxesResult } = await client.query(
            `
                UPDATE payroll_taxes
                    SET name = $1,
                    rate = $2
                    WHERE id = $3
                    RETURNING *
            `,
            [name, rate, id],
        );

        await client.query('SELECT process_payroll_for_job($1)', [
            rows[0].job_id,
        ]);

        await client.query('COMMIT;');

        const updatedRow = toCamelCase(updatePayrollTaxesResult[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a payroll tax
 */
export const deletePayrollTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM payroll_taxes
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM payroll_taxes
                    WHERE id = $1
            `,
            [id],
        );

        await client.query('SELECT process_payroll_for_job($1)', [
            rows[0].job_id,
        ]);

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted payroll tax');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
