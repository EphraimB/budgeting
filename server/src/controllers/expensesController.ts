import { type NextFunction, type Request, type Response } from 'express';
import {
    expenseQueries,
    cronJobQueries,
    taxesQueries,
} from '../models/queryData.js';
import determineCronValues from '../crontab/determineCronValues.js';
import {
    handleError,
    parseIntOrFallback,
    nextTransactionFrequencyDate,
} from '../utils/helperFunctions.js';
import { type Expense } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param expense - Expense object
 * @returns Expense object with the correct types
 * Converts the expense object to the correct types
 **/
const parseExpenses = (expense: Record<string, string>): Expense => ({
    id: parseInt(expense.expense_id),
    accountId: parseInt(expense.account_id),
    taxId: parseIntOrFallback(expense.tax_id),
    amount: parseFloat(expense.expense_amount),
    title: expense.expense_title,
    description: expense.expense_description,
    frequencyType: parseInt(expense.frequency_type),
    frequencyTypeVariable: parseInt(expense.frequency_type_variable),
    frequencyDayOfMonth: parseIntOrFallback(expense.frequency_day_of_month),
    frequencyDayOfWeek: parseIntOrFallback(expense.frequency_day_of_week),
    frequencyWeekOfMonth: parseIntOrFallback(expense.frequency_week_of_month),
    frequencyMonthOfYear: parseIntOrFallback(expense.frequency_month_of_year),
    subsidized: parseFloat(expense.expense_subsidized),
    beginDate: expense.expense_begin_date,
    endDate: expense.expense_end_date,
    dateCreated: expense.date_created,
    dateModified: expense.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the expenses
 */
export const getExpenses = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && accountId) {
            query = expenseQueries.getExpenseByIdAndAccountId;
            params = [id, accountId];
        } else if (id) {
            query = expenseQueries.getExpenseById;
            params = [id];
        } else if (accountId) {
            query = expenseQueries.getExpensesByAccountId;
            params = [accountId];
        } else {
            query = expenseQueries.getAllExpenses;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const modifiedExpenses: Expense[] = rows.map(
            (row: Record<string, string>) => parseExpenses(row),
        );

        modifiedExpenses.map((expense: Expense) => {
            const nextExpenseDate = nextTransactionFrequencyDate(expense);

            expense.nextDate = nextExpenseDate;
        });

        response.status(200).json(modifiedExpenses);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'expense'
                    : accountId
                    ? 'expenses for given account id'
                    : 'expenses'
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
 * Sends a response with the created expense and creates a cron job for the expense and inserts it into the database
 */
export const createExpense = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const {
        accountId,
        taxId,
        amount,
        title,
        description,
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        subsidized,
        begin_date,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(expenseQueries.createExpense, [
            accountId,
            taxId,
            amount,
            title,
            description,
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            subsidized,
            begin_date,
        ]);

        const modifiedExpenses = rows.map((row) => parseExpenses(row));

        const jobDetails = {
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            date: begin_date,
        };

        const cronDate = determineCronValues(jobDetails);

        // Get tax rate
        const { rows: result } = await client.query(
            taxesQueries.getTaxRateByTaxId,
            [taxId],
        );
        const taxRate = result && result.length > 0 ? result : 0;

        const uniqueId = `expense-${modifiedExpenses[0].id}`;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${accountId}, ${
                -amount + amount * subsidized
            }, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronJobResult } = await client.query(
            cronJobQueries.createCronJob,
            [uniqueId, cronDate],
        );

        const cronId: number = cronJobResult[0].cron_job_id;

        await client.query(expenseQueries.updateExpenseWithCronJobId, [
            cronId,
            modifiedExpenses[0].id,
        ]);

        await client.query('COMMIT;');

        request.expenseId = modifiedExpenses[0].id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating expense');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created expense
 */
export const createExpenseReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { expenseId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(expenseQueries.getExpenseById, [
            expenseId,
        ]);

        const modifiedExpenses = rows.map((row) => parseExpenses(row));

        response.status(201).json(modifiedExpenses);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting expense');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the updated expense and updates the cron job for the expense and updates it in the database
 */
export const updateExpense = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const {
        accountId,
        taxId,
        amount,
        title,
        description,
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        subsidized,
        beginDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(expenseQueries.getExpenseById, [
            id,
        ]);

        if (rows.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);

        const jobDetails = {
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            date: beginDate,
        };

        const cronDate = determineCronValues(jobDetails);

        await client.query('BEGIN;');

        const { rows: cronResults } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        const uniqueId = cronResults[0].unique_id;

        await client.query(`SELECT CRON.unschedule('${uniqueId}')`);

        // Get tax rate
        const { rows: result } = await client.query(
            taxesQueries.getTaxRateByTaxId,
            [taxId],
        );
        const taxRate = result && result.length > 0 ? result : 0;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${accountId}, ${
                -amount + amount * subsidized
            }, ${taxRate}, '${title}', '${description}')$$)`);

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await client.query(expenseQueries.updateExpense, [
            accountId,
            taxId,
            amount,
            title,
            description,
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            subsidized,
            beginDate,
            id,
        ]);

        await client.query('COMMIT;');

        request.expenseId = id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating expense');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated expense
 */
export const updateExpenseReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { expenseId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(expenseQueries.getExpenseById, [
            expenseId,
        ]);

        const modifiedExpenses = rows.map((row) => parseExpenses(row));

        response.status(200).json(modifiedExpenses);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating expense');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the deleted expense and deletes the cron job for the expense and deletes it from the database
 */
export const deleteExpense = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(expenseQueries.getExpenseById, [
            id,
        ]);
        if (rows.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const cronId: number = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(expenseQueries.deleteExpense, [id]);

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
        handleError(response, 'Error deleting expense');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the deleted expense
 */
export const deleteExpenseReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Expense deleted successfully');
};
