import { accountQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const parseAccounts = account => ({
    account_id: parseInt(account.account_id),
    account_name: account.account_name,
    account_type: parseInt(account.account_type),
    account_balance: parseFloat(account.account_balance),
    date_created: account.date_created,
    date_modified: account.date_modified,
});

// Get all accounts
export const getAccounts = async (request, response) => {
    const id = parseInt(request.query.id);

    const query = id ? accountQueries.getAccount : accountQueries.getAccounts;
    const params = id ? [id] : [];

    try {
        const rows = await executeQuery(query, params);
        const accounts = rows.map(account => parseAccounts(account));
        response.status(200).json(accounts);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, "Error getting accounts");
    }
};

// Create account
export const createAccount = async (request, response) => {
    const { name, type, balance } = request.body;

    try {
        const rows = await executeQuery(accountQueries.createAccount, [name, type, balance]);
        const accounts = rows.map(account => parseAccounts(account));
        response.status(201).json(accounts);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, "Error creating account");
    }
};

// Update account
export const updateAccount = async (request, response) => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;

    try {
        const rows = await executeQuery(accountQueries.updateAccount, [name, type, balance, id]);
        const accounts = rows.map(account => parseAccounts(account));
        response.status(200).json(accounts);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, "Error updating account");
    }
};

// Delete account
export const deleteAccount = async (request, response) => {
    const id = parseInt(request.params.id);

    try {
        await executeQuery(accountQueries.deleteAccount, [id]);
        response.status(200).send("Successfully deleted account");
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, "Error deleting account");
    }
};