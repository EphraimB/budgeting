import pool from '../db.js';
import { transactionHistoryQueries } from '../queryData.js';

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
export const getTransactions = (request, response) => {
    const { id } = request.query;

    const query = id ? transactionHistoryQueries.getTransaction : transactionHistoryQueries.getTransactions;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transactions", "param": null, "location": "query" } });
        }

        const transactionHistory = results.rows.map(transactionHistory => parseTransactions(transactionHistory));
        response.status(200).json(transactionHistory);
    });
};

// Create transaction
export const createTransaction = (request, response) => {
    const { account_id, title, amount, description } = request.body;

    pool.query(transactionHistoryQueries.createTransaction, [account_id, amount, title, description], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating transaction", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const transactionHistory = results.rows.map(transactionHistory => (parseTransactions(transactionHistory)));

        return response.status(201).json(transactionHistory);
    });
};

// Update transaction
export const updateTransaction = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description } = request.body;

    pool.query(transactionHistoryQueries.updateTransaction, [account_id, amount, title, description, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating transaction", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const transactionHistory = results.rows.map(transactionHistory => (parseTransactions(transactionHistory)));

        response.status(200).send(transactionHistory);
    });
};

// Delete transaction
export const deleteTransaction = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(transactionHistoryQueries.deleteTransaction, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting transaction", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted transaction");
    });
};