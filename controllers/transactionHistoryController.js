import { transactionHistoryQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../helpers/errorHandler.js';

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
        const transactionHistory = transactionResults.map(transaction => parseTransactions(transaction));
        
        response.status(200).json(transactionHistory);
    } catch (error) {
        handleError(response, 'Error getting transactions');
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
        handleError(response, 'Error creating transaction');
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

        const transactionHistory = transactionResults.map(transaction => parseTransactions(transaction));

        response.status(200).send(transactionHistory);
    } catch (error) {
        handleError(response, 'Error updating transaction');
    }
};

// Delete transaction
export const deleteTransaction = async (request, response) => {
    try {
        const id = parseInt(request.params.id);

        await executeQuery(transactionHistoryQueries.deleteTransaction, [id]);

        response.status(200).send("Successfully deleted transaction");
    } catch (error) {
        handleError(response, 'Error deleting transaction');
    }
};