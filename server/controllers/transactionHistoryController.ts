import { type Request, type Response } from 'express';
import { transactionHistoryQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type TransactionHistory } from '../types/types.js';
import { logger } from '../config/winston.js';

interface TransactionHistoryInput {
    transaction_id: string;
    account_id: string;
    transaction_amount: string;
    transaction_tax_rate: string;
    transaction_title: string;
    transaction_description: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param transactionHistory - Transaction history object
 * @returns Transaction history object with the correct types
 * Converts the transaction history object to the correct types
 */
const parseTransactions = (
    transactionHistory: TransactionHistoryInput,
): TransactionHistory => ({
    transaction_id: parseInt(transactionHistory.transaction_id),
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

    try {
        let query: string;
        let params: any[];

        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = transactionHistoryQueries.getTransactionByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = transactionHistoryQueries.getTransactionById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = transactionHistoryQueries.getTransactionsByAccountId;
            params = [account_id];
        } else {
            query = transactionHistoryQueries.getAllTransactions;
            params = [];
        }

        const transactionResults = await executeQuery<TransactionHistoryInput>(
            query,
            params,
        );

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            transactionResults.length === 0
        ) {
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

    try {
        const transactionResults = await executeQuery<TransactionHistoryInput>(
            transactionHistoryQueries.createTransaction,
            [account_id, amount, tax, title, description],
        );

        const transactionHistory: TransactionHistory[] = transactionResults.map(
            (transaction) => parseTransactions(transaction),
        );

        response.status(201).json(transactionHistory);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transaction history');
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

    try {
        const transactionResults = await executeQuery<TransactionHistoryInput>(
            transactionHistoryQueries.updateTransaction,
            [account_id, amount, tax, title, description, id],
        );

        if (transactionResults.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        const transactionHistory: TransactionHistory[] = transactionResults.map(
            (transaction) => parseTransactions(transaction),
        );

        response.status(200).json(transactionHistory);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating transaction history');
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

    try {
        const getTransactionResults =
            await executeQuery<TransactionHistoryInput>(
                transactionHistoryQueries.getTransactionById,
                [id],
            );

        if (getTransactionResults.length === 0) {
            response.status(404).send('Transaction not found');
            return;
        }

        await executeQuery(transactionHistoryQueries.deleteTransaction, [id]);

        response.status(200).send('Successfully deleted transaction history');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transaction history');
    }
};
