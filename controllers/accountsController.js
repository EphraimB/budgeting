import pool from '../models/db.js';
import { accountQueries } from '../models/queryData.js';

const parseAccounts = account => ({
    account_id: parseInt(account.account_id),
    account_name: account.account_name,
    account_type: parseInt(account.account_type),
    account_balance: parseFloat(account.account_balance),
    date_created: account.date_created,
    date_modified: account.date_modified,
});

// Get all accounts
export const getAccounts = (request, response) => {
    const id = parseInt(request.query.id);

    const query = id ? accountQueries.getAccount : accountQueries.getAccounts;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting accounts", "param": null, "location": "query" } });
        }

        const accounts = results.rows.map(account => parseAccounts(account));
        response.status(200).json(accounts);
    });
};

// Create account
export const createAccount = (request, response) => {
    const { name, type, balance } = request.body;

    pool.query(accountQueries.createAccount, [name, type, balance], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating account", "param": null, "location": "query" } });
        }

        const accounts = results.rows.map(account => parseAccounts(account));
        response.status(201).json(accounts);
    });
};

// Update account
export const updateAccount = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;

    pool.query(accountQueries.updateAccount, [name, type, balance, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating account", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const accounts = results.rows.map(account => parseAccounts(account));

        response.status(200).send(accounts);
    });
};

// Delete account
export const deleteAccount = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(accountQueries.deleteAccount, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting account", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted account");
    });
};