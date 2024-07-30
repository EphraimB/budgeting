import { type Request, type Response } from 'express';
import { transactionHistoryQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type TransactionHistory } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param transactionHistory - Transaction history object
 * @returns Transaction history object with the correct types
 * Converts the transaction history object to the correct types
 */
const parseTransactions = (
    transactionHistory: Record<string, string>,
): TransactionHistory => ({
    id: parseInt(transactionHistory.transaction_id),
    account_id: parseInt(transactionHistory.account_id),
    transaction_amount: parseFloat(transactionHistory.transaction_amount),
    transaction_tax_rate: parseFloat(transactionHistory.transaction_tax_rate),
    transaction_title: transactionHistory.transaction_title,
    transaction_description: transactionHistory.transaction_description,
    date_created: transactionHistory.date_created,
    date_modified: transactionHistory.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all transactions or a single transaction
 */
export const getTransactions = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, account_id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && account_id) {
            query = transactionHistoryQueries.getTransactionByIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = transactionHistoryQueries.getTransactionById;
            params = [id];
        } else if (account_id) {
            query = transactionHistoryQueries.getTransactionsByAccountId;
            params = [account_id];
        } else {
            query = transactionHistoryQueries.getAllTransactions;
            params = [];
        }

        const { rows: transactionResults } = await client.query(query, params);

        if (id && transactionResults.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        const transactionHistory: TransactionHistory[] = transactionResults.map(
            (transaction) => parseTransactions(transaction),
        );

        response.status(200).json(transactionHistory);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transaction history');
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
    const { account_id, title, amount, tax, description } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            transactionHistoryQueries.createTransaction,
            [account_id, amount, tax, title, description],
        );

        const transactionHistory: TransactionHistory[] = rows.map((row) =>
            parseTransactions(row),
        );

        response.status(201).json(transactionHistory);
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
    const id: number = parseInt(request.params.id);
    const { account_id, amount, tax, title, description } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            transactionHistoryQueries.updateTransaction,
            [account_id, amount, tax, title, description, id],
        );

        if (rows.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        const transactionHistory: TransactionHistory[] = rows.map((row) =>
            parseTransactions(row),
        );

        response.status(200).json(transactionHistory);
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
    const id: number = parseInt(request.params.id);

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            transactionHistoryQueries.getTransactionById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        await client.query(transactionHistoryQueries.deleteTransaction, [id]);

        response.status(200).send('Successfully deleted transaction history');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transaction history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
