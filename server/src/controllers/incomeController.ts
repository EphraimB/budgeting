import { type NextFunction, type Request, type Response } from 'express';
import { cronJobQueries, incomeQueries } from '../models/queryData.js';
import {
    handleError,
    parseIntOrFallback,
    nextTransactionFrequencyDate,
} from '../utils/helperFunctions.js';
import { type Income } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';

/**
 *
 * @param income - Income object
 * @returns Income object with the correct types
 * Converts the income object to the correct types
 **/
const parseIncome = (income: Record<string, string>): Income => ({
    id: parseInt(income.income_id),
    account_id: parseInt(income.account_id),
    tax_id: parseIntOrFallback(income.tax_id),
    income_amount: parseFloat(income.income_amount),
    income_title: income.income_title,
    income_description: income.income_description,
    frequency_type: parseInt(income.frequency_type),
    frequency_type_variable: parseInt(income.frequency_type_variable),
    frequency_day_of_month: parseIntOrFallback(income.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(income.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(income.frequency_week_of_month),
    frequency_month_of_year: parseIntOrFallback(income.frequency_month_of_year),
    income_begin_date: income.income_begin_date,
    income_end_date: income.income_end_date,
    date_created: income.date_created,
    date_modified: income.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the income object
 */
export const getIncome = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, account_id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && account_id) {
            query = incomeQueries.getIncomeByIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = incomeQueries.getIncomeById;
            params = [id];
        } else if (account_id) {
            query = incomeQueries.getIncomeByAccountId;
            params = [account_id];
        } else {
            query = incomeQueries.getIncome;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const parsedIncome = rows.map((row) => parseIncome(row));

        parsedIncome.map((income: any) => {
            const nextExpenseDate = nextTransactionFrequencyDate(income);

            income.next_date = nextExpenseDate;
        });

        response.status(200).json(parsedIncome);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'income'
                    : account_id
                    ? 'income for given account id'
                    : 'income'
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
 * Sends a response with the created income and creates a cron job for the income and inserts it into the database
 */
export const createIncome = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const {
        account_id,
        tax_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
        end_date,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(incomeQueries.createIncome, [
            account_id,
            tax_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date,
            end_date,
        ]);

        const modifiedIncome = rows.map((row) => parseIncome(row));

        const jobDetails = {
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            date: begin_date,
        };

        const cronDate = determineCronValues(jobDetails);

        const uniqueId = `income-${modifiedIncome[0].id}`;

        const taxRate = 0;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history
            (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
            VALUES (${account_id}, ${amount}, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronIdResults } = await client.query(
            cronJobQueries.createCronJob,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResults[0].cron_job_id;

        await client.query(incomeQueries.updateIncomeWithCronJobId, [
            cronId,
            modifiedIncome[0].id,
        ]);

        await client.query('COMMIT;');

        request.income_id = modifiedIncome[0].id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created income
 */
export const createIncomeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { income_id } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(incomeQueries.getIncomeById, [
            income_id,
        ]);

        const modifiedIncome = rows.map((row) => parseIncome(row));

        response.status(201).json(modifiedIncome);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the updated income and updates the cron job for the income and updates it in the database
 */
export const updateIncome = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const {
        account_id,
        tax_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
        end_date,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(incomeQueries.getIncomeById, [id]);

        if (rows.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);

        const jobDetails = {
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            date: begin_date,
        };

        const cronDate = determineCronValues(jobDetails);

        const { rows: uniqueIdResults } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        const uniqueId = uniqueIdResults[0].unique_id;

        const taxRate = 0;

        await client.query('BEGIN;');

        await client.query(`SELECT cron.unschedule('${uniqueId}')`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history
            (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
            VALUES (${account_id}, ${amount}, ${taxRate}, '${title}', '${description}')$$)`);

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await client.query(incomeQueries.updateIncome, [
            account_id,
            tax_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date,
            end_date,
            id,
        ]);

        await client.query('COMMIT;');

        request.income_id = id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated income
 */
export const updateIncomeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { income_id } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(incomeQueries.getIncomeById, [
            income_id,
        ]);

        const modifiedIncome = rows.map((row) => parseIncome(row));

        response.status(200).json(modifiedIncome);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the deleted income and deletes the cron job for the income and deletes it from the database
 */
export const deleteIncome = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(incomeQueries.getIncomeById, [id]);

        if (rows.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const cronId: number = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(incomeQueries.deleteIncome, [id]);

        const { rows: results } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        await client.query(`SELECT cron.unschedule('${results[0].unique_id}')`);

        await client.query(cronJobQueries.deleteCronJob, [cronId]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

export const deleteIncomeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Income deleted successfully');
};
