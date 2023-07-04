import { Request, Response } from 'express';
import { accountQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

interface AccountInput {
    account_id: string;
    account_name: string;
    account_type: string;
    account_balance: string;
    date_created: string;
    date_modified: string;
}

interface AccountOutput {
    account_id: number;
    account_name: string;
    account_type: number;
    account_balance: number;
    date_created: string;
    date_modified: string;
}

/**
 * 
 * @param account - Account object to parse
 * @returns - Parsed account object
 */
const parseAccounts = (account: AccountInput): AccountOutput => ({
    account_id: parseInt(account.account_id),
    account_name: account.account_name,
    account_type: parseInt(account.account_type),
    account_balance: parseFloat(account.account_balance),
    date_created: account.date_created,
    date_modified: account.date_modified
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all accounts or a single account
 */
export const getAccounts = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.query as { id?: string }; // Destructure id from query string

    try {
        // Change the query based on the presence of id
        const query: string = id ? accountQueries.getAccount : accountQueries.getAccounts;
        const params = id ? [id] : [];
        const accounts = await executeQuery<AccountInput>(query, params);

        if (id && accounts.length === 0) {
            response.status(404).send('Account not found');
            return
        }

        response.status(200).json(accounts.map(parseAccounts));
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'account' : 'accounts'}`);
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created account or an error message and posts the account to the database
 */
export const createAccount = async (request: Request, response: Response) => {
    const { name, type, balance } = request.body;

    try {
        const rows = await executeQuery<AccountInput>(accountQueries.createAccount, [name, type, balance]);
        const accounts = rows.map(account => parseAccounts(account));
        response.status(201).json(accounts);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating account');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated account or an error message and updates the account in the database
 */
export const updateAccount = async (request: Request, response: Response): Promise<void> => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;
    try {
        const account = await executeQuery<AccountInput>(accountQueries.getAccount, [id]);

        if (account.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        const rows = await executeQuery<AccountInput>(accountQueries.updateAccount, [name, type, balance, id]);
        const accounts = rows.map(account => parseAccounts(account));
        response.status(200).json(accounts);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating account');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the account from the database
 */
export const deleteAccount = async (request: Request, response: Response): Promise<void> => {
    const id = parseInt(request.params.id);
    try {
        const account = await executeQuery<AccountInput>(accountQueries.getAccount, [id]);

        if (account.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        await executeQuery(accountQueries.deleteAccount, [id]);
        response.status(200).send('Successfully deleted account');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting account');
    }
};
