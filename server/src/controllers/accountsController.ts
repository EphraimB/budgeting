import { type Request, type Response } from 'express';
import { accountQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type Account } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param account - Account object to parse
 * @returns - Parsed account object
 */
const parseAccounts = (account: Record<string, string>): Account => ({
    accountId: parseInt(account.account_id),
    accountName: account.account_name,
    accountBalance: parseFloat(account.account_balance),
    dateCreated: account.date_created,
    dateModified: account.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all accounts or a single account
 */
export const getAccounts = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.query as { id?: string }; // Destructure id from query string

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Change the query based on the presence of id
        const query: string = id
            ? accountQueries.getAccount
            : accountQueries.getAccounts;
        const params = id ? [id] : [];

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        response.status(200).json(rows.map((row) => parseAccounts(row)));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'account' : 'accounts'}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created account or an error message and posts the account to the database
 */
export const createAccount = async (request: Request, response: Response) => {
    const { name } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(accountQueries.createAccount, [
            name,
        ]);
        const accounts = rows.map((account) => parseAccounts(account));
        response.status(201).json(accounts);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating account');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated account or an error message and updates the account in the database
 */
export const updateAccount = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const { name } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: account } = await client.query(
            accountQueries.getAccount,
            [id],
        );

        if (account.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        const { rows } = await client.query(accountQueries.updateAccount, [
            name,
            id,
        ]);

        const accounts = rows.map((account) => parseAccounts(account));

        response.status(200).json(accounts);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating account');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the account from the database
 */
export const deleteAccount = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: account } = await client.query(
            accountQueries.getAccount,
            [id],
        );

        if (account.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        await client.query(accountQueries.deleteAccount, [id]);

        response.status(200).send('Successfully deleted account');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting account');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
