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

// Get all expenses
export const getExpenses = (request, response) => {
    const { id } = request.query;

    const query = id ? expenseQueries.getExpense : expenseQueries.getExpenses;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting expenses", "param": null, "location": "query" } });
        }

        const expenses = results.rows.map(expense => parseExpenses(expense));
        response.status(200).send(expenses);
    });
};

// Create expense
export const createExpense = async (request, response) => {
    try {
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
        const { cronDate, uniqueId } = scheduleCronJob({
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
        });

        const cronJobResult = await pool.query(cronJobQueries.createCronJob, [
            uniqueId,
            cronDate
        ]);
        const cronId = cronJobResult.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        const expenseResult = await pool.query(expenseQueries.createExpense, [
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

        const expenses = expenseResult.rows.map(expense => parseExpenses(expense));

        response.status(201).send(expenses);
    } catch (error) {
        response.status(400).send({
            errors: { msg: 'Error creating expense', param: null, location: 'query' }
        });
    }
};

// Update expense
export const updateExpense = async (request, response) => {
    try {
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

        const expenseResult = await pool.query(expenseQueries.getExpense, [id]);
        if (expenseResult.rows.length === 0) {
            return response.status(200).send([]);
        }

        const cronId = expenseResult.rows[0].cron_job_id;
        await deleteCronJob(cronId);

        const { uniqueId, cronDate } = scheduleCronJob(
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
        );

        await pool.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId
        ]);

        const updateResult = await pool.query(expenseQueries.updateExpense, [
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

        const expenses = updateResult.rows.map(expense => parseExpenses(expense));

        response.status(200).send(expenses);
    } catch (error) {
        response.status(400).send({
            errors: { msg: 'Error updating expense', param: null, location: 'query' }
        });
    }
};

// Delete expense
export const deleteExpense = async (request, response) => {
    try {
        const { id } = request.params;

        const expenseResult = await pool.query(expenseQueries.getExpense, [id]);
        if (expenseResult.rows.length === 0) {
            return response.status(200).send("Expense doesn't exist");
        }

        const cronId = expenseResult.rows[0].cron_job_id;
        const deleteExpenseResult = await pool.query(expenseQueries.deleteExpense, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await pool.query(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send("Expense deleted successfully");
    } catch (error) {
        response.status(400).send({ errors: { msg: 'Error deleting expense', param: null, location: 'query' } });
    }
};