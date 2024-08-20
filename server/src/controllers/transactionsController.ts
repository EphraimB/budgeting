import { type Request, type Response } from 'express';
import { handleError } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve generated transactions by account id
 */
export const getTransactionsByAccountId = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.params;
    const { fromDate, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                WITH RECURSIVE recurring AS (
                -- Initialize with the starting dates
                SELECT 
                    e.account_id,
                    e.title,
                    e.description,
                    e.begin_date AS date,
                    -e.amount + (-e.amount * COALESCE((SELECT rate FROM taxes WHERE id = e.tax_id), 0)) AS amount,
                    e.frequency_type,
                    e.frequency_type_variable,
                    e.frequency_day_of_week,
                    e.frequency_week_of_month,
                    e.frequency_month_of_year
                FROM 
                    expenses e
                UNION
                    SELECT
                      l.account_id,
                      l.title,
                      l.description,
                      l.begin_date AS date,
                      -l.plan_amount AS amount,
                      l.frequency_type,
                      l.frequency_type_variable,
                      l.frequency_day_of_week,
                      l.frequency_week_of_month,
                      l.frequency_month_of_year
                	FROM loans l
  							UNION
  								SELECT 
                    t.source_account_id,
                    t.title,
                    t.description,
                    t.begin_date AS date,
                    -t.amount AS amount,
                    t.frequency_type,
                    t.frequency_type_variable,
                    t.frequency_day_of_week,
                    t.frequency_week_of_month,
                    t.frequency_month_of_year
                	FROM 
                    transfers t
  							UNION
  								SELECT 
                    td.destination_account_id,
                    td.title,
                    td.description,
                    td.begin_date AS date,
                    td.amount AS amount,
                    td.frequency_type,
                    td.frequency_type_variable,
                    td.frequency_day_of_week,
                    td.frequency_week_of_month,
                    td.frequency_month_of_year
                	FROM 
                    transfers td
                UNION ALL
                -- Generate subsequent billing dates based on frequency type
                SELECT
                    r.account_id,
                    r.title,
                    r.description,
                    CASE
                        -- Daily frequency
                        WHEN r.frequency_type = 0 THEN r.date + interval '1 day' * r.frequency_type_variable
                        -- Weekly frequency
                        WHEN r.frequency_type = 1 THEN 
                            CASE
                                WHEN extract('dow' from r.date) <= r.frequency_day_of_week THEN
                                    r.date + interval '1 week' * r.frequency_type_variable + interval '1 day' * (r.frequency_day_of_week - extract('dow' from r.date))
                                ELSE
                                    r.date + interval '1 week' * r.frequency_type_variable + interval '1 day' * (7 - extract('dow' from r.date) + r.frequency_day_of_week)
                            END
                        -- Monthly frequency
                        WHEN r.frequency_type = 2 THEN
                            (r.date + interval '1 month' * r.frequency_type_variable)::date +
                            (CASE 
                                WHEN r.frequency_day_of_week IS NOT NULL THEN
                                    interval '1 day' * ((r.frequency_day_of_week - extract('dow' from (r.date + interval '1 month' * r.frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            (CASE 
                                WHEN r.frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * r.frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN r.frequency_type = 3 THEN
                            (r.date + interval '1 year' * r.frequency_type_variable)::date +
                            (CASE 
                                WHEN r.frequency_day_of_week IS NOT NULL THEN
                                    interval '1 day' * ((r.frequency_day_of_week - extract('dow' from (r.date + interval '1 year' * r.frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            (CASE 
                                WHEN r.frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * r.frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        ELSE 
                            NULL
                    END AS date,
                    r.amount,
                    r.frequency_type,
                    r.frequency_type_variable,
                    r.frequency_day_of_week,
                    r.frequency_week_of_month,
                    r.frequency_month_of_year
                FROM 
                    recurring r
                WHERE
                    (r.date + interval '1 day') <= $3
            ),
            transaction_details AS (
                -- Get all transactions and calculate amount after tax
                SELECT 
                    th.account_id,
                    th.title,
                    th.description,
                    th.date_created AS date,
                    th.amount + (th.amount * th.tax_rate) AS amount
                FROM 
                    transaction_history th
            ),
            combined_details AS (
                SELECT account_id, title, description, date, amount FROM recurring WHERE date >= now()
            ),
            current_balance AS (
                -- Calculate the current balance for each account based on transactions
                SELECT 
                    account_id,
                    COALESCE(SUM(amount), 0) AS current_balance
                FROM 
                    transaction_details
                GROUP BY 
                    account_id
            ),
            transaction_with_balance AS (
                -- Calculate the remaining balance after each transaction (reversed for transactions)
                SELECT 
                    td.account_id,
                    td.title,
                    td.description,
                    td.date,
                    td.amount,
                    SUM(td.amount) OVER (PARTITION BY td.account_id ORDER BY td.date DESC) AS running_balance
                FROM 
                    transaction_details td
                UNION
                    SELECT
                    cd.account_id,
                    cd.title,
                    cd.description,
                    cd.date,
                    cd.amount,
                    COALESCE(SUM(-cd.amount) OVER (PARTITION BY cd.account_id ORDER BY cd.date ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), cd.amount - cd.amount) AS running_balance
                FROM 
                    combined_details cd
                WHERE 
                    cd.date < $3
            )
            SELECT
                a.id AS account_id,
                COALESCE(cb.current_balance, 0) AS current_balance,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'title', twb.title,
                            'description', twb.description,
                            'amount', twb.amount,
                            'date', twb.date,
                            'balance', 
                                CASE 
                                    WHEN twb.running_balance IS NOT NULL THEN COALESCE(cb.current_balance, 0) - twb.running_balance + twb.amount 
                                    ELSE NULL 
                                END
                        ) ORDER BY twb.date
                    ) FILTER (WHERE twb.account_id IS NOT NULL), '[]'::json
                ) AS transactions
            FROM 
                accounts a
            LEFT JOIN 
                current_balance cb ON a.id = cb.account_id
            LEFT JOIN 
                transaction_with_balance twb ON a.id = twb.account_id
            WHERE a.id = $1 AND date > $2
            GROUP BY 
                a.id, cb.current_balance
            ORDER BY 
                a.id;
            `,
            [accountId, fromDate, toDate],
        );

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting generated transactions');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
