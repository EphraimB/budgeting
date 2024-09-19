import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

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
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                                begin_date::date + interval '1 day' * frequency_type_variable
                            END
                        -- Weekly frequency
                    WHEN frequency_type = 1 THEN 
                    CASE
                    WHEN begin_date > now() THEN
                        begin_date
                    ELSE
                        CASE 
                            WHEN frequency_day_of_week IS NOT NULL THEN
                                CASE
                                    -- If the desired day of the week is today or later this week
                                    WHEN frequency_day_of_week >= extract('dow' from begin_date) THEN
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * (frequency_day_of_week - extract('dow' from now()))
                                    ELSE
                                        -- If the desired day of the week is earlier in the week, move to the next week
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * frequency_day_of_week
                                END
                            ELSE
                                -- Handle the case where frequency_day_of_week is NULL
                                -- Return a default value, e.g., the current date or next week's start date
                                begin_date + interval '1 week' * frequency_type_variable
                            END
                        END

                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
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
                        END
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                            -- Calculate the base next year date
                            (begin_date + interval '1 year' * frequency_type_variable)::date +
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
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                    date_created,
                    date_modified
                    FROM income
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
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                                begin_date::date + interval '1 day' * frequency_type_variable
                            END
                        -- Weekly frequency
                    WHEN frequency_type = 1 THEN 
                    CASE
                    WHEN begin_date > now() THEN
                        begin_date
                    ELSE
                        CASE 
                            WHEN frequency_day_of_week IS NOT NULL THEN
                                CASE
                                    -- If the desired day of the week is today or later this week
                                    WHEN frequency_day_of_week >= extract('dow' from begin_date) THEN
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * (frequency_day_of_week - extract('dow' from now()))
                                    ELSE
                                        -- If the desired day of the week is earlier in the week, move to the next week
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * frequency_day_of_week
                                END
                            ELSE
                                -- Handle the case where frequency_day_of_week is NULL
                                -- Return a default value, e.g., the current date or next week's start date
                                begin_date + interval '1 week' * frequency_type_variable
                            END
                        END

                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
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
                        END
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                            -- Calculate the base next year date
                            (begin_date + interval '1 year' * frequency_type_variable)::date +
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
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                    date_created,
                    date_modified
                    FROM income
                    GROUP BY id
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting income`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the income object by id
 */
export const getIncomeById = async (
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
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                                begin_date::date + interval '1 day' * frequency_type_variable
                            END
                        -- Weekly frequency
                    WHEN frequency_type = 1 THEN 
                    CASE
                    WHEN begin_date > now() THEN
                        begin_date
                    ELSE
                        CASE 
                            WHEN frequency_day_of_week IS NOT NULL THEN
                                CASE
                                    -- If the desired day of the week is today or later this week
                                    WHEN frequency_day_of_week >= extract('dow' from begin_date) THEN
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * (frequency_day_of_week - extract('dow' from now()))
                                    ELSE
                                        -- If the desired day of the week is earlier in the week, move to the next week
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * frequency_day_of_week
                                END
                            ELSE
                                -- Handle the case where frequency_day_of_week is NULL
                                -- Return a default value, e.g., the current date or next week's start date
                                begin_date + interval '1 week' * frequency_type_variable
                            END
                        END

                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
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
                        END
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                            -- Calculate the base next year date
                            (begin_date + interval '1 year' * frequency_type_variable)::date +
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
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                    date_created,
                    date_modified
                    FROM income
                    WHERE id = $1 AND account_id = $2
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
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                                begin_date::date + interval '1 day' * frequency_type_variable
                            END
                        -- Weekly frequency
                    WHEN frequency_type = 1 THEN 
                    CASE
                    WHEN begin_date > now() THEN
                        begin_date
                    ELSE
                        CASE 
                            WHEN frequency_day_of_week IS NOT NULL THEN
                                CASE
                                    -- If the desired day of the week is today or later this week
                                    WHEN frequency_day_of_week >= extract('dow' from begin_date) THEN
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * (frequency_day_of_week - extract('dow' from now()))
                                    ELSE
                                        -- If the desired day of the week is earlier in the week, move to the next week
                                        begin_date + interval '1 week' * frequency_type_variable + interval '1 day' * frequency_day_of_week
                                END
                            ELSE
                                -- Handle the case where frequency_day_of_week is NULL
                                -- Return a default value, e.g., the current date or next week's start date
                                begin_date + interval '1 week' * frequency_type_variable
                            END
                        END

                        -- Monthly frequency
                        WHEN frequency_type = 2 THEN 
                            -- Calculate the base next month date
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
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
                        END
                        -- Annual frequency
                        WHEN frequency_type = 3 THEN 
                            CASE
                                WHEN begin_date > now() THEN
                            begin_date
                            ELSE
                            -- Calculate the base next year date
                            (begin_date + interval '1 year' * frequency_type_variable)::date +
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
                            END
                        ELSE 
                            NULL
                    END AS next_date,
                    date_created,
                    date_modified
                    FROM income
                    WHERE id = $1
                    GROUP BY id
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting income for account id of ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created income and creates a cron job for the income and inserts it into the database
 */
export const createIncome = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const {
        accountId,
        taxId,
        amount,
        title,
        description,
        frequency,
        beginDate,
        endDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const jobDetails = {
            frequencyType: frequency.type,
            frequencyTypeVariable: frequency.typeVariable,
            frequencyDayOfMonth: frequency.dayOfMonth,
            frequencyDayOfWeek: frequency.dayOfWeek,
            frequencyWeekOfMonth: frequency.weekOfMonth,
            frequencyMonthOfYear: frequency.monthOfYear,
            date: beginDate,
        };

        const cronDate = determineCronValues(jobDetails);

        const uniqueId = uuidv4();

        const taxRate = 0;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history
            (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
            VALUES (${accountId}, ${amount}, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronIdResults } = await client.query(
            `
            INSERT INTO cron_jobs
            (unique_id, cron_expression)
            VALUES ($1, $2)
            RETURNING *
            `,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResults[0].id;

        const { rows } = await client.query(
            `
                INSERT INTO income
                    (account_id, tax_id, cron_job_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING *
            `,
            [
                accountId,
                taxId,
                cronId,
                amount,
                title,
                description,
                frequency.type,
                frequency.typeVariable,
                frequency.dayOfMonth,
                frequency.dayOfWeek,
                frequency.weekOfMonth,
                frequency.monthOfYear,
                beginDate,
                endDate,
            ],
        );

        await client.query('COMMIT;');

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
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
 * Sends a response with the updated income and updates the cron job for the income and updates it in the database
 */
export const updateIncome = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const {
        accountId,
        taxId,
        amount,
        title,
        description,
        frequency,
        beginDate,
        endDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                    FROM income
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);

        const jobDetails = {
            frequencyType: frequency.type,
            frequencyTypeVariable: frequency.typeVariable,
            frequencyDayOfMonth: frequency.dayOfMonth,
            frequencyDayOfWeek: frequency.dayOfWeek,
            frequencyWeekOfMonth: frequency.weekOfMonth,
            frequencyMonthOfYear: frequency.monthOfYear,
            date: beginDate,
        };

        const cronDate = determineCronValues(jobDetails);

        const { rows: uniqueIdResults } = await client.query(
            `
                SELECT unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
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
            VALUES (${accountId}, ${amount}, ${taxRate}, '${title}', '${description}')$$)`);

        await client.query(
            `
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
            `,
            [uniqueId, cronDate, cronId],
        );

        const { rows: updateIncomeResults } = await client.query(
            `
                UPDATE income
                    SET account_id = $1, tax_id = $2, amount = $3, title = $4, description = $5, frequency_type = $6, frequency_type_variable = $7, frequency_day_of_month = $8, frequency_day_of_week = $9, frequency_week_of_month = $10, frequency_month_of_year = $11, begin_date = $12, end_date = $13
                    WHERE id = $14
                    RETURNING *
            `,
            [
                accountId,
                taxId,
                amount,
                title,
                description,
                frequency.type,
                frequency.typeVariable,
                frequency.dayOfMonth,
                frequency.dayOfWeek,
                frequency.weekOfMonth,
                frequency.monthOfYear,
                beginDate,
                endDate,
                id,
            ],
        );

        await client.query('COMMIT;');

        const updatedRow = toCamelCase(updateIncomeResults[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
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
 * Sends a response with the deleted income and deletes the cron job for the income and deletes it from the database
 */
export const deleteIncome = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                    FROM income
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const cronId: number = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM income WHERE id = $1
            `,
            [id],
        );

        const { rows: results } = await client.query(
            `
                SELECT id, unique_id
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

        response.status(200).send('Income deleted successfully');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
