import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 *
 * @param request - The request object
 * @param response - The response object
 * Sends a response with all transfers
 */
export const getTransfers = async (
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
                SELECT id, cron_job_id, source_account_id, destination_account_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'type_variable', frequency_type_variable,
                          	'day_of_month', frequency_day_of_month,
                          	'day_of_week', frequency_day_of_week,
                          	'week_of_month', frequency_week_of_month,
                          	'month_of_year', frequency_month_of_year	
                        )
                    ) AS frequency,
                    json_agg(
                        json_build_object(
                    		'begin_date', begin_date,
                            'end_date', end_date
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
                                    json_agg(
                                        json_build_object(
                                        'date_created', date_created,
                                        'date_modified', date_modified
                                        )
                                    ) AS creation_dates
                FROM transfers
                WHERE account_id = $1
                GROUP BY id
            `;
            params = [accountId];
        } else {
            query = `
                SELECT id, cron_job_id, source_account_id, destination_account_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'type_variable', frequency_type_variable,
                          	'day_of_month', frequency_day_of_month,
                          	'day_of_week', frequency_day_of_week,
                          	'week_of_month', frequency_week_of_month,
                          	'month_of_year', frequency_month_of_year	
                        )
                    ) AS frequency,
                    json_agg(
                        json_build_object(
                    		'begin_date', begin_date,
                            'end_date', end_date
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
                                        json_agg(
                                            json_build_object(
                                            'date_created', date_created,
                                            'date_modified', date_modified
                                            )
                                        ) AS creation_dates
                    FROM transfers
                    GROUP BY id
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfers');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * Sends a response with a single transfer
 */
export const getTransfersById = async (
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
                SELECT id, cron_job_id, source_account_id, destination_account_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'type_variable', frequency_type_variable,
                          	'day_of_month', frequency_day_of_month,
                          	'day_of_week', frequency_day_of_week,
                          	'week_of_month', frequency_week_of_month,
                          	'month_of_year', frequency_month_of_year	
                        )
                    ) AS frequency,
                    json_agg(
                        json_build_object(
                    		'begin_date', begin_date,
                            'end_date', end_date
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
                                    json_agg(
                                        json_build_object(
                                        'date_created', date_created,
                                        'date_modified', date_modified
                                        )
                                    ) AS creation_dates
                FROM transfers
                WHERE id = $1 AND account_id = $2
                GROUP BY id
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT id, cron_job_id, source_account_id, destination_account_id, amount, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'type_variable', frequency_type_variable,
                          	'day_of_month', frequency_day_of_month,
                          	'day_of_week', frequency_day_of_week,
                          	'week_of_month', frequency_week_of_month,
                          	'month_of_year', frequency_month_of_year	
                        )
                    ) AS frequency,
                    json_agg(
                        json_build_object(
                    		'begin_date', begin_date,
                            'end_date', end_date
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
                                    json_agg(
                                        json_build_object(
                                        'date_created', date_created,
                                        'date_modified', date_modified
                                        )
                                    ) AS creation_dates
                FROM transfers
                WHERE id = $1
                GROUP BY id
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        const retreivedRow = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRow[0]);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting transfers for account id of ${id}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * Sends a response with the newly created transfer
 */
export const createTransfer = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const {
        sourceAccountId,
        destinationAccountId,
        amount,
        title,
        description,
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        beginDate,
        endDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

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

        const taxRate = 0;

        const uniqueId = uuidv4();

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history
                (account_id, amount, tax_rate, title, description)
                VALUES
                (${sourceAccountId}, ${-amount}, ${taxRate}, '${title}', '${description}')
                (${destinationAccountId}, ${amount}, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronIdResults } = await client.query(
            `
                INSERT INTO cron_jobs
                    (unique_id, cron_expression)
                    VALUES ($1, $2)
                    RETURNING *
            `,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResults[0].cron_job_id;

        const { rows: transferResult } = await client.query(
            `
                INSERT INTO transfers
                    (cron_job_id, source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING *
            `,
            [
                cronId,
                sourceAccountId,
                destinationAccountId,
                amount,
                title,
                description,
                frequencyType,
                frequencyTypeVariable,
                frequencyDayOfMonth,
                frequencyDayOfWeek,
                frequencyWeekOfMonth,
                frequencyMonthOfYear,
                beginDate,
                endDate,
            ],
        );

        await client.query('COMMIT;');

        const insertedRow = toCamelCase(transferResult[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transfer');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * Sends a response with the updated transfer
 */
export const updateTransfer = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const {
        sourceAccountId,
        destinationAccountId,
        amount,
        title,
        description,
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        beginDate,
        endDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                    FROM transfers
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Transfer not found');
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
                (account_id, amount, tax_rate, title, description)
                VALUES
                (${sourceAccountId}, ${-amount}, ${taxRate}, '${title}', '${description}')
                (${destinationAccountId}, ${amount}, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: updateTransfersResult } = await client.query(
            `
                UPDATE transfers
                    SET cron_job_id = $1
                    source_account_id = $2,
                    destination_account_id = $3,
                    amount = $4,
                    title = $5,
                    description = $6,
                    frequency_type = $7,
                    frequency_type_variable = $8,
                    frequency_day_of_month = $9,
                    frequency_day_of_week = $10,
                    frequency_week_of_month = $11,
                    frequency_month_of_year = $12,
                    begin_date = $13,
                    end_date = $14
                    WHERE id = $15
                    RETURNING *
            `,
            [
                cronId,
                sourceAccountId,
                destinationAccountId,
                amount,
                title,
                description,
                frequencyType,
                frequencyTypeVariable,
                frequencyDayOfMonth,
                frequencyDayOfWeek,
                frequencyWeekOfMonth,
                frequencyMonthOfYear,
                beginDate,
                endDate,
                id,
            ],
        );

        await client.query(
            `
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
                    `,
            [uniqueId, cronDate, cronId],
        );

        await client.query('COMMIT;');

        const updatedRow = toCamelCase(updateTransfersResult[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating transfer');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * Sends a response with the deleted transfer
 */
export const deleteTransfer = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                    FROM transfers
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM transfers
                    WHERE id = $1
            `,
            [id],
        );

        const cronId: number = parseInt(rows[0].cron_job_id);

        const { rows: results } = await client.query(
            `
                SELECT unique_id
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

        response.status(200).send('Transfer deleted successfully');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transfer');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
