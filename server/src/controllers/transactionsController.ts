import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve generated transactions for all accounts
 */
export const getTransactions = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { fromDate, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT a_id, current_balance, transactions FROM get_generated_transactions($1, $2)
            `,
            [fromDate, toDate],
        );

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting generated transactions');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

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
                SELECT a_id, current_balance, transactions FROM get_generated_transactions($1, $2, $3)
            `,
            [fromDate, toDate, accountId],
        );

        const retreivedRow = toCamelCase(rows[0]);

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting generated transactions for account id of ${accountId}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};
