import { type Request, type Response } from 'express';
import { accountQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type Account } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all accounts
 */
export const getAccounts = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(`
            SELECT 
                accounts.id,
                accounts.name,
                COALESCE(t.total_transaction_amount_after_tax, 0) AS balance,
                accounts.date_created, 
                accounts.date_modified 
            FROM 
                accounts
            LEFT JOIN 
                (SELECT 
                account_id, 
                SUM(amount + (amount * tax_rate)) AS total_transaction_amount_after_tax 
                FROM 
                transaction_history 
                GROUP BY 
                account_id) AS t ON accounts.id = t.account_id 
            ORDER BY 
                accounts.id ASC;
            `);

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting accounts`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single account
 */
export const getAccountsById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
            SELECT 
                accounts.id,
                accounts.name,
                COALESCE(t.total_transaction_amount_after_tax, 0) AS balance,
                accounts.date_created, 
                accounts.date_modified 
            FROM 
                accounts
            LEFT JOIN 
                (SELECT 
                account_id, 
                SUM(amount + (amount * tax_rate)) AS total_transaction_amount_after_tax 
                FROM 
                transaction_history 
                GROUP BY 
                account_id) AS t ON accounts.id = t.account_id 
            WHERE 
                accounts.id = $1;
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting account of ${id}`);
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
        const { rows } = await client.query(
            `
            INSERT INTO accounts
                (name)
                VALUES ($1)
                RETURNING *
        `,
            [name],
        );

        response.status(201).json(rows);
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
    const { id } = request.params;
    const { name } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: account } = await client.query(
            `
                SELECT COUNT(id)
                    FROM accounts
                    WHERE id = $1;
            `,
            [id],
        );

        if (account.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        const { rows } = await client.query(
            `
            UPDATE accounts
                SET name = $1
                WHERE id = $2
                RETURNING *
            `,
            [name, id],
        );

        response.status(200).json(rows);
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
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: account } = await client.query(
            `
                SELECT COUNT(id)
                    FROM accounts
                    WHERE id = $1;
            `,
            [id],
        );

        if (account.length === 0) {
            response.status(404).send('Account not found');
            return;
        }

        await client.query(
            `
            DELETE FROM accounts
                WHERE id = $1
            `,
            [id],
        );

        response.status(200).send('Successfully deleted account');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting account');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
