import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type PayrollTax } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param payrollTax - Payroll tax object
 * @returns - Payroll tax object with parsed values
 */
const payrollTaxesParse = (payrollTax: Record<string, string>): PayrollTax => ({
    id: parseInt(payrollTax.payroll_taxes_id),
    job_id: parseInt(payrollTax.job_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate),
});

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
    const { job_id, id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && job_id) {
            query = payrollQueries.getPayrollTaxesByIdAndJobId;
            params = [id, job_id];
        } else if (id) {
            query = payrollQueries.getPayrollTaxesById;
            params = [id];
        } else if (job_id) {
            query = payrollQueries.getPayrollTaxesByJobId;
            params = [job_id];
        } else {
            query = payrollQueries.getAllPayrollTaxes;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTax[] = rows.map((payrollTax) =>
            payrollTaxesParse(payrollTax),
        );

        response.status(200).json(payrollTaxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'payroll tax'
                    : job_id
                    ? 'payroll taxes for given job id'
                    : 'payroll taxes'
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
 * Sends a POST request to the database to create a payroll tax
 */
export const createPayrollTax = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { job_id, name, rate } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(payrollQueries.createPayrollTax, [
            job_id,
            name,
            rate,
        ]);

        await client.query('SELECT process_payroll_for_job($1)', [job_id]);

        await client.query('COMMIT;');

        const payrollTaxes: PayrollTax[] = rows.map((row) =>
            payrollTaxesParse(row),
        );

        request.payroll_taxes_id = payrollTaxes[0].id;

        next();
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
 * Sends a GET request to the database to retrieve a payroll tax
 */
export const createPayrollTaxReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { payroll_taxes_id } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollTaxesById,
            [payroll_taxes_id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTax[] = rows.map((row) =>
            payrollTaxesParse(row),
        );

        response.status(201).json(payrollTaxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payroll tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update a payroll tax
 */
export const updatePayrollTax = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;
    const { name, rate } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollTaxesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(payrollQueries.updatePayrollTax, [name, rate, id]);

        await client.query('SELECT process_payroll_for_job($1)', [
            rows[0].job_id,
        ]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

export const updatePayrollTaxReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollTaxesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTax[] = rows.map((row) =>
            payrollTaxesParse(row),
        );

        response.status(200).json(payrollTaxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payroll tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a DELETE request to the database to delete a payroll tax
 */
export const deletePayrollTax = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            payrollQueries.getPayrollTaxesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(payrollQueries.deletePayrollTax, [id]);

        await client.query('SELECT process_payroll_for_job($1)', [
            rows[0].job_id,
        ]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll tax');
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
export const deletePayrollTaxReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Successfully deleted payroll tax');
};
