import { transactionHistoryQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const parseTransactions = transactionHistory => ({
    transaction_id: parseInt(transactionHistory.transaction_id),
    account_id: parseInt(transactionHistory.account_id),
    transaction_amount: parseFloat(transactionHistory.transaction_amount),
    transaction_title: transactionHistory.account_type,
    transaction_description: transactionHistory.transaction_description,
    date_created: transactionHistory.date_created,
    date_modified: transactionHistory.date_modified,
});

// Get all transactions
export const getTransactions = async (request, response) => {
    try {
        const { id } = request.query;
        const query = id ? transactionHistoryQueries.getTransaction : transactionHistoryQueries.getTransactions;
        const params = id ? [id] : [];

        const transactionResults = await executeQuery(query, params);

        if (id && transactionResults.length === 0) {
            return response.status(404).send('Transaction not found');
        }

        const transactionHistory = transactionResults.map(transaction => parseTransactions(transaction));

        response.status(200).json(transactionHistory);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error getting transaction history');
    }
};

// Create transaction
export const createTransaction = async (request, response) => {
    try {
        const { account_id, title, amount, description } = request.body;
        const transactionResults = await executeQuery(
            transactionHistoryQueries.createTransaction,
            [account_id, amount, title, description]
        );

        const transactionHistory = transactionResults.map(transaction => parseTransactions(transaction));

        response.status(201).json(transactionHistory);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating transaction history');
    }
};

// Update transaction
export const updateTransaction = async (request, response) => {
    try {
        const id = parseInt(request.params.id);
        const { account_id, amount, title, description } = request.body;

        const transactionResults = await executeQuery(
            transactionHistoryQueries.updateTransaction,
            [account_id, amount, title, description, id]
        );

        if (transactionResults.length === 0) {
            return response.status(404).send('Transaction not found');
        }

        const transactionHistory = transactionResults.map(transaction => parseTransactions(transaction));

        response.status(200).json(transactionHistory);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating transaction history');
    }
};

// Delete transaction
export const deleteTransaction = async (request, response) => {
    try {
        const id = parseInt(request.params.id);

        const getTransactionResults = await executeQuery(transactionHistoryQueries.getTransaction, [id]);

        if (getTransactionResults.length === 0) {
            return response.status(404).send("Transaction not found");
        }

        await executeQuery(transactionHistoryQueries.deleteTransaction, [id]);

        response.status(200).send("Successfully deleted transaction history");
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transaction history');
    }
};