import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all transactions
 */
export const getTransactions = async (
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
                SELECT * FROM transaction_history
                    WHERE account_id = $1
                    ORDER BY id ASC;
            `;
            params = [accountId];
        } else {
            query = `
                SELECT * FROM transaction_history
                    ORDER BY transaction_id ASC
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = rows.map((row) => toCamelCase(row)); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transaction histories');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single transaction
 */
export const getTransactionsById = async (
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
                SELECT * FROM transaction_history
                    WHERE id = $1 AND account_id = $2
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT * FROM transaction_history
                    WHERE id = $1
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting transaction history for id of ${id}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the newly created transaction
 */
export const createTransaction = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId, title, amount, tax, description } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                INSERT INTO transaction_history
                    (account_id, amount, tax_rate, title, description)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;
            `,
            [accountId, amount, tax, title, description],
        );

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transaction history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated transaction
 */
export const updateTransaction = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId, amount, tax, title, description } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM transaction_history
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        const { rows: transactionHistoryResults } = await client.query(
            `
                UPDATE transaction_history
                    SET account_id = $1,
                    amount = $2,
                    tax_rate = $3,
                    title = $4,
                    description = $5
                    WHERE id = $6
                    RETURNING *
            `,
            [accountId, amount, tax, title, description, id],
        );

        const updatedRow = toCamelCase(transactionHistoryResults[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating transaction history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a message indicating the transaction was deleted
 */
export const deleteTransaction = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM transaction_history
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        await client.query(
            `
                DELETE FROM transaction_history
                    WHERE id = $1
            `,
            [id],
        );

        response
            .status(200)
            .send(`Successfully deleted transaction history for id of ${id}`);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transaction history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
