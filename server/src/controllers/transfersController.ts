import { type NextFunction, type Request, type Response } from 'express';
import { handleError } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';

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
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
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
                                        json_agg(
                                            json_build_object(
                                            'dateCreated', date_created,
                                            'dateModified', date_modified
                                            )
                                        ) AS creation_dates
                    FROM transfers
                    GROUP BY id
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        response.status(200).json(rows);
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
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
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
                                    json_agg(
                                        json_build_object(
                                        'dateCreated', date_created,
                                        'dateModified', date_modified
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

        response.status(200).json(rows);
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
 * @param next - The next function
 * Sends a response with the newly created transfer
 */
export const createTransfer = async (
    request: Request,
    response: Response,
    next: NextFunction,
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

        const { rows: transferResult } = await client.query(
            `
                INSERT INTO transfers
                    (source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING *
            `,
            [
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

        const uniqueId = `transfer-${transferResult[0].id}`;

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

        await client.query(
            `
                UPDATE transfers
                    SET cron_job_id = $1
                    WHERE id = $2
            `,
            [cronId, transferResult[0].id],
        );

        await client.query('COMMIT;');

        request.transferId = transferResult[0].id;

        next();
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
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created transfer
 */
export const createTransferReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { transferId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM transfers
                    WHERE id = $1
            `,
            [transferId],
        );

        response.status(201).json(rows);
    } catch (error) {
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
 * @param next - The next function
 * Sends a response with the updated transfer
 */
export const updateTransfer = async (
    request: Request,
    response: Response,
    next: NextFunction,
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
                UPDATE transfers
                    SET cron_job_id = $1
                    WHERE id = $2
                    RETURNING *
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

        await client.query(
            `
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
            `,
            [uniqueId, cronDate, cronId],
        );

        await client.query(
            `
                UPDATE transfers
                    SET source_account_id = $1,
                    destination_account_id = $2,
                    amount = $3,
                    title = $4,
                    description = $5,
                    frequency_type = $6,
                    frequency_type_variable = $7,
                    frequency_day_of_month = $8,
                    frequency_day_of_week = $9,
                    frequency_week_of_month = $10,
                    frequency_month_of_year = $11,
                    begin_date = $12,
                    end_date = $13
                    WHERE id = $14
            `,
            [
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

        await client.query('COMMIT;');

        request.transferId = +id;

        next();
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
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated transfer
 */
export const updateTransferReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { transferId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM transfers
                    WHERE id = $1
            `,
            [transferId],
        );

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfer');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with the deleted transfer
 */
export const deleteTransfer = async (
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

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transfer');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the deleted transfer
 */
export const deleteTransferReturnObject = async (
    _: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Transfer deleted successfully');
};
