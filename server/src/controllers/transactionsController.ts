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
                WITH transaction_details AS (
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
            expenses_details AS (
                -- Get all expenses and calculate amount after tax as negative amounts to subtract from balance
                SELECT 
                    e.account_id,
                    e.title,
                    e.description,
                    e.begin_date + interval '1 month' AS date,
                    -(e.amount + (e.amount * COALESCE((SELECT rate FROM taxes WHERE id = e.tax_id), 0))) AS amount
                FROM 
                    expenses e
            ),
            combined_details AS (
                -- Combine transaction details and expense details into one result set
                SELECT * FROM transaction_details
                UNION ALL
                SELECT * FROM expenses_details
            ),
            current_balance AS (
                -- Calculate the current balance for each account based on transactions only
                SELECT 
                    account_id,
                    COALESCE(SUM(amount), 0) AS current_balance
                FROM 
                    transaction_details
                GROUP BY 
                    account_id
            ),
            transaction_with_balance AS (
                -- Calculate the running balance after each transaction and expense (combined in chronological order)
                SELECT 
                    cd.account_id,
                    cd.title,
                    cd.description,
                    cd.date,
                    cd.amount,
                    SUM(cd.amount) OVER (PARTITION BY cd.account_id ORDER BY cd.date ASC) AS running_balance
                FROM 
                    combined_details cd
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
                                    WHEN twb.running_balance IS NOT NULL THEN twb.running_balance
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
