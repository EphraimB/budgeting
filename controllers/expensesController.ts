import { Request, Response } from 'express';
import { expenseQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../bree/jobs/scheduleCronJob.js';
import deleteCronJob from '../bree/jobs/deleteCronJob.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

interface ExpenseInput {
    expense_id: string;
    account_id: string;
    expense_amount: string;
    expense_title: string;
    expense_description: string;
    frequency_type: string;
    frequency_type_variable: string;
    frequency_day_of_month: string;
    frequency_day_of_week: string;
    frequency_week_of_month: string;
    frequency_month_of_year: string;
    expense_begin_date: string;
    expense_end_date: string;
    date_created: string;
    date_modified: string;
}

interface ExpenseOutput {
    expense_id: number;
    account_id: number;
    expense_amount: number;
    expense_title: string;
    expense_description: string;
    frequency_type: string;
    frequency_type_variable: string;
    frequency_day_of_month: string;
    frequency_day_of_week: string;
    frequency_week_of_month: string;
    frequency_month_of_year: string;
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
const parseExpenses = (expense: ExpenseInput): ExpenseOutput => ({
    expense_id: parseInt(expense.expense_id),
    account_id: parseInt(expense.account_id),
    expense_amount: parseFloat(expense.expense_amount),
    expense_title: expense.expense_title,
    expense_description: expense.expense_description,
    frequency_type: expense.frequency_type,
    frequency_type_variable: expense.frequency_type_variable,
    frequency_day_of_month: expense.frequency_day_of_month,
    frequency_day_of_week: expense.frequency_day_of_week,
    frequency_week_of_month: expense.frequency_week_of_month,
    frequency_month_of_year: expense.frequency_month_of_year,
    expense_begin_date: expense.expense_begin_date,
    expense_end_date: expense.expense_end_date,
    date_created: expense.date_created,
    date_modified: expense.date_modified
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * @returns All expenses or a single expense
 */
export const getExpenses = async (request: Request, response: Response): Promise<void> => {
    const { id, account_id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (id && account_id) {
            query = expenseQueries.getExpenseByIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = expenseQueries.getExpenseById;
            params = [id];
        } else if (account_id) {
            query = expenseQueries.getExpensesByAccountId;
            params = [account_id];
        } else {
            query = expenseQueries.getAllExpenses;
            params = [];
        }

        const expenses = await executeQuery<ExpenseInput>(query, params);

        if ((id || account_id) && expenses.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        response.status(200).json(expenses.map(parseExpenses));
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'expense' : (account_id ? 'expenses for given account_id' : 'expenses')}`);
    }
};

export const createExpense = async (request, response) => {
    const {
        account_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date
    } = request.body;

    const negativeAmount = -amount;
    const cronParams = {
        begin_date,
        account_id,
        negativeAmount,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year
    };

    try {
        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);
        const cronId = (await executeQuery(cronJobQueries.createCronJob, [
            uniqueId,
            cronDate
        ]))[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        const expenses = await executeQuery(expenseQueries.createExpense, [
            account_id,
            cronId,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date
        ]);

        response.status(201).json(expenses.map(parseExpenses));
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating expense');
    }
};

// Update expense
export const updateExpense = async (request, response) => {
    const id = parseInt(request.params.id);
    const {
        account_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date
    } = request.body;

    const cronParams = {
        begin_date,
        account_id,
        amount,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year
    };

    try {
        const expenseResult = await executeQuery(expenseQueries.getExpense, [id]);
        if (expenseResult.length === 0) {
            return response.status(404).send('Expense not found');
        }

        const cronId = expenseResult[0].cron_job_id;
        await deleteCronJob(cronId);

        const { uniqueId, cronDate } = await scheduleCronJob(cronParams);

        await executeQuery(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId
        ]);

        const expenses = await executeQuery(expenseQueries.updateExpense, [
            account_id,
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
            id
        ]);

        response.status(200).json(expenses.map(parseExpenses));
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating expense');
    }
};

// Delete expense
export const deleteExpense = async (request, response) => {
    const { id } = request.params;

    try {
        const expenseResult = await executeQuery(expenseQueries.getExpense, [id]);
        if (expenseResult.length === 0) {
            return response.status(404).send('Expense not found');
        }

        const cronId = expenseResult[0].cron_job_id;

        await executeQuery(expenseQueries.deleteExpense, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send('Expense deleted successfully');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting expense');
    }
};
