import { type NextFunction, type Request, type Response } from 'express';
import {
    expenseQueries,
    cronJobQueries,
    cronQueries,
    taxesQueries,
} from '../models/queryData.js';
import { manipulateCron, scheduleQuery } from '../utils/helperFunctions.js';
import determineCronValues from '../crontab/determineCronValues.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
    nextTransactionFrequencyDate,
} from '../utils/helperFunctions.js';
import { type Expense } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param expense - Expense object
 * @returns Expense object with the correct types
 * Converts the expense object to the correct types
 **/
const parseExpenses = (expense: Record<string, string>): Expense => ({
    id: parseInt(expense.expense_id),
    account_id: parseInt(expense.account_id),
    tax_id: parseIntOrFallback(expense.tax_id),
    amount: parseFloat(expense.expense_amount),
    title: expense.expense_title,
    description: expense.expense_description,
    frequency_type: parseInt(expense.frequency_type),
    frequency_type_variable: parseIntOrFallback(
        expense.frequency_type_variable,
    ),
    frequency_day_of_month: parseIntOrFallback(expense.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(expense.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(
        expense.frequency_week_of_month,
    ),
    frequency_month_of_year: parseIntOrFallback(
        expense.frequency_month_of_year,
    ),
    subsidized: parseFloat(expense.expense_subsidized),
    begin_date: expense.expense_begin_date,
    end_date: expense.expense_end_date,
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

        const expenses = await executeQuery(query, params);

        if (id !== null && id !== undefined && expenses.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const modifiedExpenses = expenses.map(parseExpenses);

        modifiedExpenses.map((expense) => {
            const nextExpenseDate = nextTransactionFrequencyDate(
                expense,
                'expenses',
            );

            expense.next_date = nextExpenseDate;
        });

        response.status(200).json(modifiedExpenses);
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
        const expenses = await executeQuery(expenseQueries.createExpense, [
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
        ]);

        const modifiedExpenses = expenses.map(parseExpenses);

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

        // Get tax rate
        const result = await executeQuery(taxesQueries.getTaxRateByTaxId, [
            tax_id,
        ]);
        const taxRate = result && result.length > 0 ? result : 0;

        const unique_id = `expense-${modifiedExpenses[0].id}-${title}`;

        scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${-amount}, ${taxRate}, '${title}', '${description}')`,
        );

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                unique_id,
                cronDate,
            ])
        )[0].cron_job_id;

        await executeQuery(expenseQueries.updateExpenseWithCronJobId, [
            cronId,
            modifiedExpenses[0].id,
        ]);

        request.expense_id = modifiedExpenses[0].id;

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
        const expenses = await executeQuery(expenseQueries.getExpenseById, [
            expense_id,
        ]);

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
        const expenseResult = await executeQuery(
            expenseQueries.getExpenseById,
            [id],
        );

        if (expenseResult.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const cronId: number = parseInt(expenseResult[0].cron_job_id);

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

        const [{ unique_id }] = await executeQuery(cronJobQueries.getCronJob, [
            cronId,
        ]);

        const data = {
            schedule: cronDate,
            script_path: '/scripts/createTransaction.sh',
            expense_type: 'expense',
            account_id,
            id,
            amount: -amount + amount * subsidized,
            title,
            description,
        };

        const [success, responseData] = await manipulateCron(
            data,
            'PUT',
            unique_id,
        );

        if (!success) {
            response.status(500).send(responseData);
        }

        await executeQuery(cronJobQueries.updateCronJob, [
            responseData.unique_id,
            cronDate,
            cronId,
        ]);

        await executeQuery(expenseQueries.updateExpense, [
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
        const expenses = await executeQuery(expenseQueries.getExpenseById, [
            expense_id,
        ]);

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

        const [success, responseData] = await manipulateCron(
            null,
            'DELETE',
            results[0].unique_id,
        );

        if (!success) {
            response.status(500).send(responseData);
        }

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting expense');
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
