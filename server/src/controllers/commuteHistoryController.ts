import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute histories
 */
export const getCommuteHistory = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT *
                    FROM commute_history
                    WHERE account_id = $1
            `;
            params = [accountId];
        } else {
            query = `
                SELECT *
                    FROM commute_history
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting commute histories');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single history
 */
export const getCommuteHistoryById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT *
                    FROM commute_history
                    WHERE id = $1 AND account_id = $2
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT *
                    FROM commute_history
                    WHERE id = $1
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        const retreivedRow = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting commute history for account id of ${id}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created history or an error message and posts the history to the database
 */
export const createCommuteHistory = async (
    request: Request,
    response: Response,
) => {
    const { accountId, fare, commuteSystem, fareType, timestamp } =
        request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                INSERT INTO commute_history
                (account_id, fare, commute_system, fare_type, timestamp, is_timed_pass)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
            [accountId, fare, commuteSystem, fareType, timestamp, false],
        );

        const insertedRow = toCamelCase(rows); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating commute history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated commute history or an error message and updates the history in the database
 */
export const updateCommuteHistory = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId, fare, commuteSystem, fareType, timestamp } =
        request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM commute_history
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        const { rows: updateCommuteHistory } = await client.query(
            `
                UPDATE commute_history
                SET account_id = $1,
                fare = $2,
                commute_system = $3,
                fare_type = $4,
                timestamp = $5
                WHERE id = $6
                RETURNING *
            `,
            [accountId, fare, commuteSystem, fareType, timestamp, id],
        );

        const updatedRow = toCamelCase(updateCommuteHistory); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating commute history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the commute history from the database
 */
export const deleteCommuteHistory = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM commute_history
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        await client.query(
            `
                DELETE FROM commute_history
                WHERE id = $1
            `,
            [id],
        );

        response.status(200).send('Successfully deleted commute history');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting commute history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
