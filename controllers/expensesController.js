import pool from '../models/db.js';
import { expenseQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../jobs/scheduleCronJob.js';
import deleteCronJob from '../jobs/deleteCronJob.js';

const parseExpenses = expense => ({
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
    date_modified: expense.date_modified,
});

const handleError = (response, message) => {
    response.status(400).send({
        errors: {
            msg: message,
            param: null,
            location: 'query'
        }
    });
};

const executeQuery = async (query, params = []) => {
    try {
        const { rows } = await pool.query(query, params);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
};

export const getExpenses = async (request, response) => {
    const { id } = request.query;
    const query = id ? expenseQueries.getExpense : expenseQueries.getExpenses;
    const params = id ? [id] : [];

    try {
        const expenses = await executeQuery(query, params);
        response.status(200).send(expenses.map(parseExpenses));
    } catch (error) {
        handleError(response, 'Error getting expenses');
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

        response.status(201).send(expenses.map(parseExpenses));
    } catch (error) {
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
            return response.status(200).send([]);
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

        response.status(200).send(expenses.map(parseExpenses));
    } catch (error) {
        handleError(response, 'Error updating expense');
    }
};

// Delete expense
export const deleteExpense = async (request, response) => {
    const { id } = request.params;

    try {
        const expenseResult = await executeQuery(expenseQueries.getExpense, [id]);
        if (expenseResult.length === 0) {
            return response.status(200).send("Expense doesn't exist");
        }

        const cronId = expenseResult[0].cron_job_id;

        await executeQuery(expenseQueries.deleteExpense, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send("Expense deleted successfully");
    } catch (error) {
        handleError(response, 'Error deleting expense');
    }
};
