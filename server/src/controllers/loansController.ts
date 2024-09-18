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
 * Sends a GET request to the database to retrieve all loans
 */
export const getLoans = async (
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
                SELECT id, account_id, cron_job_id, interest_cron_job_id, amount, plan_amount, recipient, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year	
                        )
                    ) AS frequency,
                    interest_rate,
                    interest_frequency_type,
                    subsidized,
                    begin_date,
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
                    -- Calculate when the loan will be fully paid back
                    CASE 
                        -- Number of periods needed to fully repay the loan
                        WHEN plan_amount > 0 THEN 
                            -- Calculate remaining periods needed to repay the loan
                            CASE
                                WHEN frequency_type = 0 THEN -- Daily repayment
                                    begin_date + interval '1 day' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 1 THEN -- Weekly repayment
                                    begin_date + interval '1 week' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 2 THEN -- Monthly repayment
                                    begin_date + interval '1 month' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 3 THEN -- Yearly repayment
                                    begin_date + interval '1 year' * ceil((amount / plan_amount) * frequency_type_variable)
                            END
                        ELSE
                            NULL
                    END AS fully_paid_back_date,
                    date_created,
                    date_modified
                FROM loans
                WHERE account_id = $1
                GROUP BY id
            `;
            params = [accountId];
        } else {
            query = `
                SELECT id, account_id, cron_job_id, interest_cron_job_id, amount, plan_amount, recipient, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year	
                        )
                    ) AS frequency,
                    interest_rate,
                    interest_frequency_type,
                    subsidized,
                    begin_date,
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
                    -- Calculate when the loan will be fully paid back
                    CASE 
                        -- Number of periods needed to fully repay the loan
                        WHEN plan_amount > 0 THEN 
                            -- Calculate remaining periods needed to repay the loan
                            CASE
                                WHEN frequency_type = 0 THEN -- Daily repayment
                                    begin_date + interval '1 day' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 1 THEN -- Weekly repayment
                                    begin_date + interval '1 week' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 2 THEN -- Monthly repayment
                                    begin_date + interval '1 month' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 3 THEN -- Yearly repayment
                                    begin_date + interval '1 year' * ceil((amount / plan_amount) * frequency_type_variable)
                            END
                        ELSE
                            NULL
                    END AS fully_paid_back_date,
                    date_created,
                    date_modified
                FROM loans
                GROUP BY id
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = rows.map((row) => toCamelCase(row)); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting loans');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all loans
 */
export const getLoansById = async (
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
                SELECT id, account_id, cron_job_id, interest_cron_job_id, amount, plan_amount, recipient, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year		
                        )
                    ) AS frequency,
                    interest_rate,
                    interest_frequency_type,
                    subsidized,
                    begin_date,
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
                    -- Calculate when the loan will be fully paid back
                    CASE 
                        -- Number of periods needed to fully repay the loan
                        WHEN plan_amount > 0 THEN 
                            -- Calculate remaining periods needed to repay the loan
                            CASE
                                WHEN frequency_type = 0 THEN -- Daily repayment
                                    begin_date + interval '1 day' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 1 THEN -- Weekly repayment
                                    begin_date + interval '1 week' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 2 THEN -- Monthly repayment
                                    begin_date + interval '1 month' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 3 THEN -- Yearly repayment
                                    begin_date + interval '1 year' * ceil((amount / plan_amount) * frequency_type_variable)
                            END
                        ELSE
                            NULL
                    END AS fully_paid_back_date,
                    date_created,
                    date_modified
                FROM loans
                WHERE id = $1 account_id = $2
                GROUP BY id
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT id, account_id, cron_job_id, interest_cron_job_id, amount, plan_amount, recipient, title, description, json_agg(
                        json_build_object(
                            'type', frequency_type,
                            'typeVariable', frequency_type_variable,
                          	'dayOfMonth', frequency_day_of_month,
                          	'dayOfWeek', frequency_day_of_week,
                          	'weekOfMonth', frequency_week_of_month,
                          	'monthOfYear', frequency_month_of_year		
                        )
                    ) AS frequency,
                    interest_rate,
                    interest_frequency_type,
                    subsidized,
                    begin_date,
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
                    -- Calculate when the loan will be fully paid back
                    CASE 
                        -- Number of periods needed to fully repay the loan
                        WHEN plan_amount > 0 THEN 
                            -- Calculate remaining periods needed to repay the loan
                            CASE
                                WHEN frequency_type = 0 THEN -- Daily repayment
                                    begin_date + interval '1 day' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 1 THEN -- Weekly repayment
                                    begin_date + interval '1 week' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 2 THEN -- Monthly repayment
                                    begin_date + interval '1 month' * ceil((amount / plan_amount) * frequency_type_variable)
                                WHEN frequency_type = 3 THEN -- Yearly repayment
                                    begin_date + interval '1 year' * ceil((amount / plan_amount) * frequency_type_variable)
                            END
                        ELSE
                            NULL
                    END AS fully_paid_back_date,
                    date_created,
                    date_modified
                FROM loans
                WHERE id = $1
                GROUP BY id
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting loans for id of ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new loan
 */
export const createLoan = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const {
        accountId,
        amount,
        planAmount,
        recipient,
        title,
        description,
        frequency,
        interestRate,
        interestFrequencyType,
        subsidized,
        beginDate,
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

        const taxRate = 0;

        const uniqueId = uuidv4();

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${accountId}, ${
                -parseFloat(planAmount) +
                parseFloat(planAmount) * parseFloat(subsidized)
            }, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronIdResult } = await client.query(
            `
                    INSERT INTO cron_jobs
                        (unique_id, cron_expression)
                        VALUES ($1, $2)
                        RETURNING *
                `,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResult[0].id;

        const interestUniqueId = uuidv4();

        const jobDetailsInterest = {
            frequency_type: interestFrequencyType,
            date: beginDate,
        };

        const cronDateInterest = determineCronValues(jobDetailsInterest);

        const { rows: interestCronIdResult } = await client.query(
            `
                INSERT INTO cron_jobs
                    (unique_id, cron_expression)
                    VALUES ($1, $2)
                    RETURNING *
            `,
            [interestUniqueId, cronDateInterest],
        );

        const interestCronId: number = interestCronIdResult[0].id;

        const { rows: loanResults } = await client.query(
            `
                INSERT INTO loans
                    (account_id, cron_job_id, interest_cron_job_id, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, interest_rate, interest_frequency_type, subsidized, begin_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                    RETURNING *
            `,
            [
                accountId,
                cronId,
                interestCronId,
                amount,
                planAmount,
                recipient,
                title,
                description,
                frequency.type,
                frequency.typeVariable,
                frequency.dayOfMonth,
                frequency.dayOfWeek,
                frequency.weekOfMonth,
                frequency.monthOfYear,
                interestRate,
                interestFrequencyType,
                subsidized,
                beginDate,
            ],
        );

        await client.query(`
            SELECT cron.schedule('${interestUniqueId}', '${cronDateInterest}',
            $$UPDATE loans SET amount = amount + (amount * ${interestRate}) WHERE id = ${loanResults[0].id}$$)`);

        await client.query('COMMIT;');

        const insertedRow = toCamelCase(loanResults[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a loan
 */
export const updateLoan = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const {
        accountId,
        amount,
        planAmount,
        recipient,
        title,
        description,
        frequency,
        interestRate,
        interestFrequencyType,
        subsidized,
        beginDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id, interest_cron_job_id
                    FROM loans
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);
        const interestCronId: number = parseInt(rows[0].interest_cron_job_id);

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
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${
                -parseFloat(planAmount) +
                parseFloat(planAmount) * parseFloat(subsidized)
            }, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: interestUniqueIdResults } = await client.query(
            `
                SELECT unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [interestCronId],
        );

        const interestUniqueId = interestUniqueIdResults[0].unique_id;

        await client.query(
            `
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
            `,
            [uniqueId, cronDate, cronId],
        );

        const jobDetailsInterest = {
            frequencyType: interestFrequencyType,
            date: beginDate,
        };

        const cronDateInterest = determineCronValues(jobDetailsInterest);

        await client.query(`SELECT cron.unschedule('${interestUniqueId}')`);

        await client.query(`
            SELECT cron.schedule('${interestUniqueId}', '${cronDateInterest}',
            $$UPDATE loans SET amount = amount + (amount * ${interestRate}) WHERE id = ${id}$$)`);

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
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
            `,
            [uniqueId, cronDateInterest, interestCronId],
        );

        const { rows: updateLoansResult } = await client.query(
            `
                UPDATE loans
                    SET account_id = $1,
                    amount = $2,
                    plan_amount = $3,
                    recipient = $4,
                    title = $5,
                    description = $6,
                    frequency_type = $7,
                    frequency_type_variable = $8,
                    frequency_day_of_month = $9,
                    frequency_day_of_week = $10,
                    frequency_week_of_month = $11,
                    frequency_month_of_year = $12,
                    interest_rate = $13,
                    interest_frequency_type = $14,
                    subsidized = $15,
                    begin_date = $16
                    WHERE id = $17
                    RETURNING *
            `,
            [
                accountId,
                amount,
                planAmount,
                recipient,
                title,
                description,
                frequency.type,
                frequency.typeVariable,
                frequency.dayOfMonth,
                frequency.dayOfWeek,
                frequency.weekOfMonth,
                frequency.monthOfYear,
                interestRate,
                interestFrequencyType,
                subsidized,
                beginDate,
                id,
            ],
        );

        await client.query('COMMIT;');

        const updatedRow = toCamelCase(updateLoansResult[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a loan
 */
export const deleteLoan = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id, interest_cron_job_id
                    FROM loans
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM loans
                    WHERE id = $1
            `,
            [id],
        );

        const { rows: results } = await client.query(
            `
                SELECT unique_id
                    FROM cron_jobs
                        WHERE id = $1
            `,
            [cronId],
        );

        await client.query(`SELECT cron.unschedule('${results[0].unique_id}')`);

        const interestCronId = rows[0].interest_cron_job_id;

        const { rows: interestResults } = await client.query(
            `
                SELECT unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [interestCronId],
        );

        await client.query(
            `SELECT cron.unschedule('${interestResults[0].unique_id}')`,
        );

        await client.query(
            `
                DELETE FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );
        await client.query(
            `
                DELETE FROM cron_jobs
                    WHERE id = $1
            `,
            [interestCronId],
        );

        await client.query('COMMIT;');

        response.status(200).send('Loan deleted successfully');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
