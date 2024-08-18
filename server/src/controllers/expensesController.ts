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
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT id, account_id, tax_id, cron_job_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year	
                        )
                    ) AS frequency,
                    subsidized,
                     json_agg(
                        json_build_object(
                          'beginDate', begin_date,
                          'endDate', end_date
                          )
                       ) AS dates,
                       CASE 
                        -- Daily frequency
                        WHEN frequency_type = 0 THEN 
                            -- Daily billing
                            now()::date + interval '1 day' * frequency_type_variable
                        -- Weekly frequency
                        WHEN frequency_type = 1 THEN 
                            -- Calculate the next date based on the day of the week
                            date_trunc('week', now()) + interval '1 day' * (frequency_day_of_week::int - extract('dow' from now())::int)
                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            (begin_date + interval '1 month' * frequency_type_variable)::date +
                            -- Adjust for frequency_day_of_week (if provided)
                            (CASE 
                                WHEN frequency_day_of_week IS NOT NULL THEN
                                    -- Calculate day difference and add it as an interval
                                    interval '1 day' * ((frequency_day_of_week - extract('dow' from (begin_date + interval '1 month' * frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            -- Adjust for week_of_month (if provided)
                            (CASE 
                                WHEN frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            -- Calculate the next date based on the month and day
                            CASE 
                                WHEN now()::date <= make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int) THEN
                                    make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int)
                                ELSE
                                    make_date(extract('year' from now())::int + 1, frequency_month_of_year::int, frequency_day_of_month::int)
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
                                        )
                                    ) AS creation_dates
                FROM expenses
                WHERE account_id = $1
                GROUP BY id
            `;
            params = [accountId];
        } else {
            query = `
                SELECT id, account_id, tax_id, cron_job_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year	
                        )
                    ) AS frequency,
                    subsidized,
                     json_agg(
                        json_build_object(
                          'beginDate', begin_date,
                          'endDate', end_date
                          )
                       ) AS dates,
                       CASE 
                        -- Daily frequency
                        WHEN frequency_type = 0 THEN 
                            -- Daily billing
                            now()::date + interval '1 day' * frequency_type_variable
                        -- Weekly frequency
                        WHEN frequency_type = 1 THEN 
                            -- Calculate the next date based on the day of the week
                            date_trunc('week', now()) + interval '1 day' * (frequency_day_of_week::int - extract('dow' from now())::int)
                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            (begin_date + interval '1 month' * frequency_type_variable)::date +
                            -- Adjust for frequency_day_of_week (if provided)
                            (CASE 
                                WHEN frequency_day_of_week IS NOT NULL THEN
                                    -- Calculate day difference and add it as an interval
                                    interval '1 day' * ((frequency_day_of_week - extract('dow' from (begin_date + interval '1 month' * frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            -- Adjust for week_of_month (if provided)
                            (CASE 
                                WHEN frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            -- Calculate the next date based on the month and day
                            CASE 
                                WHEN now()::date <= make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int) THEN
                                    make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int)
                                ELSE
                                    make_date(extract('year' from now())::int + 1, frequency_month_of_year::int, frequency_day_of_month::int)
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
                                        )
                                    ) AS creation_dates
                FROM expenses
                GROUP BY id
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        rows.map((expense: Expense) => {
            const nextExpenseDate = nextTransactionFrequencyDate(expense);

            expense.nextDate = nextExpenseDate;
        });

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting expenses');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the expenses
 */
export const getExpensesById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT id, account_id, tax_id, cron_job_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year	
                        )
                    ) AS frequency,
                    subsidized,
                     json_agg(
                        json_build_object(
                          'beginDate', begin_date,
                          'endDate', end_date
                          )
                       ) AS dates,
                       CASE 
                        -- Daily frequency
                        WHEN frequency_type = 0 THEN 
                            -- Daily billing
                            now()::date + interval '1 day' * frequency_type_variable
                        -- Weekly frequency
                        WHEN frequency_type = 1 THEN 
                            -- Calculate the next date based on the day of the week
                            date_trunc('week', now()) + interval '1 day' * (frequency_day_of_week::int - extract('dow' from now())::int)
                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            (begin_date + interval '1 month' * frequency_type_variable)::date +
                            -- Adjust for frequency_day_of_week (if provided)
                            (CASE 
                                WHEN frequency_day_of_week IS NOT NULL THEN
                                    -- Calculate day difference and add it as an interval
                                    interval '1 day' * ((frequency_day_of_week - extract('dow' from (begin_date + interval '1 month' * frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            -- Adjust for week_of_month (if provided)
                            (CASE 
                                WHEN frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            -- Calculate the next date based on the month and day
                            CASE 
                                WHEN now()::date <= make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int) THEN
                                    make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int)
                                ELSE
                                    make_date(extract('year' from now())::int + 1, frequency_month_of_year::int, frequency_day_of_month::int)
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
                                        )
                                    ) AS creation_dates
                FROM expenses
                WHERE id = $1, account_id = $2
                GROUP BY id
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT id, account_id, tax_id, cron_job_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year	
                        )
                    ) AS frequency,
                    subsidized,
                     json_agg(
                        json_build_object(
                          'beginDate', begin_date,
                          'endDate', end_date
                          )
                       ) AS dates,
                       CASE 
                        -- Daily frequency
                        WHEN frequency_type = 0 THEN 
                            -- Daily billing
                            now()::date + interval '1 day' * frequency_type_variable
                        -- Weekly frequency
                        WHEN frequency_type = 1 THEN 
                            -- Calculate the next date based on the day of the week
                            date_trunc('week', now()) + interval '1 day' * (frequency_day_of_week::int - extract('dow' from now())::int)
                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            (begin_date + interval '1 month' * frequency_type_variable)::date +
                            -- Adjust for frequency_day_of_week (if provided)
                            (CASE 
                                WHEN frequency_day_of_week IS NOT NULL THEN
                                    -- Calculate day difference and add it as an interval
                                    interval '1 day' * ((frequency_day_of_week - extract('dow' from (begin_date + interval '1 month' * frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            -- Adjust for week_of_month (if provided)
                            (CASE 
                                WHEN frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            -- Calculate the next date based on the month and day
                            CASE 
                                WHEN now()::date <= make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int) THEN
                                    make_date(extract('year' from now())::int, frequency_month_of_year::int, frequency_day_of_month::int)
                                ELSE
                                    make_date(extract('year' from now())::int + 1, frequency_month_of_year::int, frequency_day_of_month::int)
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
                                        )
                                    ) AS creation_dates
                FROM expenses
                WHERE id = $1
                GROUP BY id
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        rows.map((expense: Expense) => {
            const nextExpenseDate = nextTransactionFrequencyDate(expense);

            expense.nextDate = nextExpenseDate;
        });

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting expenses for id of ${id}`);
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

        const { rows } = await client.query(
            `
                INSERT INTO expenses
                    (account_id, tax_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, subsidized, begin_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING *
            `,
            [
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
            ],
        );

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

        const uniqueId = `expense-${rows[0].id}`;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${
                -amount + amount * subsidized
            }, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronJobResult } = await client.query(
            `
                INSERT INTO cron_jobs
                    (unique_id, cron_expression)
                    VALUES ($1, $2)
                    RETURNING *
            `,
            [uniqueId, cronDate],
        );

        const cronId: number = cronJobResult[0].id;

        await client.query(
            `
                UPDATE expenses
                SET cron_job_id = $1
                WHERE id = $2
                RETURNING *
            `,
            [cronId, rows[0].id],
        );

        await client.query('COMMIT;');

        request.expenseId = rows[0].id;

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
        const { rows } = await client.query(
            `
                SELECT * FROM expenses
                    WHERE id = $1
            `,
            [expenseId],
        );

        response.status(201).json(rows);
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
    const { id } = request.params;
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
        const { rows } = await client.query(
            `
                SELECT *
                    FROM expenses
                    WHERE id = $1
            `,
            [id],
        );

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
            `
                SELECT unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );

        const uniqueId = cronResults[0].unique_id;

        await client.query(`SELECT CRON.unschedule('${uniqueId}')`);

        // Get tax rate
        const { rows: result } = await client.query(
            `
                SELECT tax_rate
                    FROM taxes
                    WHERE id = $1
            `,
            [taxId],
        );
        const taxRate = result && result.length > 0 ? result : 0;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${
                -amount + amount * subsidized
            }, ${taxRate}, '${title}', '${description}')$$)`);

        await client.query(
            `
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
                    RETURNING *
            `,
            [uniqueId, cronDate, cronId],
        );

        await client.query(
            `
                UPDATE expenses
                    SET account_id = $1,
                    tax_id = $2,
                    amount = $3,
                    title = $4,
                    description = $5,
                    frequency_type = $6,
                    frequency_type_variable = $7,
                    frequency_day_of_month = $8,
                    frequency_day_of_week = $9,
                    frequency_week_of_month = $10,
                    frequency_month_of_year = $11,
                    subsidized = $12,
                    begin_date = $13
                    WHERE id = $14 RETURNING *
            `,
            [
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
            ],
        );

        await client.query('COMMIT;');

        request.expenseId = +id;

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
        const { rows } = await client.query(
            `
                SELECT *
                    FROM expenses
                    WHERE id = $1
            `,
            [expenseId],
        );

        response.status(200).json(rows);
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
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                    FROM expenses
                    WHERE id = $1
            `,
            [id],
        );
        if (rows.length === 0) {
            response.status(404).send('Expense not found');
            return;
        }

        const cronId: number = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM expenses
                    WHERE id = $1
            `,
            [id],
        );

        const { rows: results } = await client.query(
            `
                SELECT *
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );

        await client.query(`SELECT cron.unschedule('${results[0].unique_id}')`);

        await client.query(
            `
                DELETE FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );

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
    _: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Expense deleted successfully');
};
