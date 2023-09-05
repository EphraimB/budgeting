import { type NextFunction, type Request, type Response } from 'express';
import { expenseQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
} from '../utils/helperFunctions.js';
import { type Expense } from '../types/types.js';
import { logger } from '../config/winston.js';

interface ExpenseInput {
    expense_id: string;
    account_id: string;
    cron_job_id: string;
    tax_id: string;
    expense_amount: string;
    expense_title: string;
    expense_description: string;
    frequency_type: string;
    frequency_type_variable: string;
    frequency_day_of_month: string;
    frequency_day_of_week: string;
    frequency_week_of_month: string;
    frequency_month_of_year: string;
    expense_subsidized: string;
    expense_begin_date: string;
    expense_end_date: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param expense - Expense object
 * @returns Expense object with the correct types
 * Converts the expense object to the correct types
 **/
const parseExpenses = (expense: ExpenseInput): Expense => ({
    expense_id: parseInt(expense.expense_id),
    account_id: parseInt(expense.account_id),
    tax_id: parseIntOrFallback(expense.tax_id),
    expense_amount: parseFloat(expense.expense_amount),
    expense_title: expense.expense_title,
    expense_description: expense.expense_description,
    frequency_type: parseInt(expense.frequency_type),
    frequency_type_variable: parseIntOrFallback(expense.frequency_type_variable),
    frequency_day_of_month: parseIntOrFallback(expense.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(expense.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(expense.frequency_week_of_month),
    frequency_month_of_year: parseIntOrFallback(expense.frequency_month_of_year),
    expense_subsidized: parseFloat(expense.expense_subsidized),
    expense_begin_date: expense.expense_begin_date,
    expense_end_date: expense.expense_end_date,
    date_created: expense.date_created,
    date_modified: expense.date_modified,
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
    const { id, account_id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = expenseQueries.getExpenseByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = expenseQueries.getExpenseById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = expenseQueries.getExpensesByAccountId;
            params = [account_id];
        } else {
            query = expenseQueries.getAllExpenses;
            params = [];
        }

        const expenses = await executeQuery<ExpenseInput>(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            expenses.length === 0
        ) {
            response.status(404).send('Expense not found');
            return;
        }

        response.status(200).json(expenses.map(parseExpenses));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'expense'
                    : account_id !== null && account_id !== undefined
                    ? 'expenses for given account_id'
                    : 'expenses'
            }`,
        );
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
        subsidized,
        begin_date,
    } = request.body;

    try {
        const expenses = await executeQuery<ExpenseInput>(
            expenseQueries.createExpense,
            [
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
                subsidized,
                begin_date,
            ],
        );

        const modifiedExpenses = expenses.map(parseExpenses);

        const cronParams = {
            date: begin_date,
            account_id,
            id: modifiedExpenses[0].expense_id,
            amount: -amount + amount * subsidized,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/scripts/createTransaction.sh',
            type: 'expense',
        };

        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                uniqueId,
                cronDate,
            ])
        )[0].cron_job_id;

        logger.info('Cron job created ' + cronId.toString());

        await executeQuery(expenseQueries.updateExpenseWithCronJobId, [
            cronId,
            modifiedExpenses[0].expense_id,
        ]);

        request.expense_id = modifiedExpenses[0].expense_id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating expense');
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
    const { expense_id } = request;

    try {
        const expenses = await executeQuery<ExpenseInput>(
            expenseQueries.getExpenseById,
            [expense_id],
        );

        const modifiedExpenses = expenses.map(parseExpenses);

        response.status(201).json(modifiedExpenses);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting expense');
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
        subsidized,
        begin_date,
    } = request.body;

    try {
        const cronParams = {
            date: begin_date,
            account_id,
            id,
            amount: -amount + amount * subsidized,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/scripts/createTransaction.sh',
            type: 'expense',
        };

        const expenseResult = await executeQuery<ExpenseInput>(
            expenseQueries.getExpenseById,
            [id],
        );

        if (expenseResult.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const cronId: number = parseInt(expenseResult[0].cron_job_id);
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            logger.error('Cron job not found');
            response.status(404).send('Cron job not found');
            return;
        }

        const { uniqueId, cronDate } = await scheduleCronJob(cronParams);

        await executeQuery(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await executeQuery<ExpenseInput>(expenseQueries.updateExpense, [
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
            subsidized,
            begin_date,
            id,
        ]);

        request.expense_id = id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating expense');
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
    const { expense_id } = request;

    try {
        const expenses = await executeQuery<ExpenseInput>(
            expenseQueries.getExpenseById,
            [expense_id],
        );

        const modifiedExpenses = expenses.map(parseExpenses);

        response.status(200).json(modifiedExpenses);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating expense');
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

    try {
        const expenseResult = await executeQuery(
            expenseQueries.getExpenseById,
            [id],
        );
        if (expenseResult.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const cronId: number = expenseResult[0].cron_job_id;

        await executeQuery(expenseQueries.deleteExpense, [id]);

        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            logger.error('Cron job not found');
            response.status(404).send('Cron job not found');
            return;
        }

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting expense');
    }
};

export const deleteExpenseReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Expense deleted successfully');
};
