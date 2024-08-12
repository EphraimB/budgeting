import { type Request, type Response } from 'express';
import { commuteHistoryQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type CommuteHistory } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

interface CommuteHistoryInput {
    commute_history_id: string;
    account_id: string;
    fare_amount: string;
    commute_system: string;
    fare_type: string;
    timestamp: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param commuteHistory - Commute history object to parse
 * @returns - Parsed commute history object
 */
const parseCommuteHistory = (
    commuteHistory: CommuteHistoryInput,
): CommuteHistory => ({
    id: parseInt(commuteHistory.commute_history_id),
    accountId: parseInt(commuteHistory.account_id),
    fareAmount: parseFloat(commuteHistory.fare_amount),
    commuteSystem: commuteHistory.commute_system,
    fareType: commuteHistory.fare_type,
    timestamp: commuteHistory.timestamp,
    dateCreated: commuteHistory.date_created,
    dateModified: commuteHistory.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute histories or a single history
 */
export const getCommuteHistory = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, accountId } = request.query as {
        id?: string;
        accountId?: string;
    }; // Destructure id from query string

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        // Change the query based on the presence of id
        if (id && accountId) {
            query = commuteHistoryQueries.getCommuteHistoryByIdAndAccountId;
            params = [id, accountId];
        } else if (id) {
            query = commuteHistoryQueries.getCommuteHistoryById;
            params = [id];
        } else if (accountId) {
            query = commuteHistoryQueries.getCommuteHistoryByAccountId;
            params = [accountId];
        } else {
            query = commuteHistoryQueries.getCommuteHistory;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        const commuteHistory = rows.map((row) => parseCommuteHistory(row));

        response.status(200).json(commuteHistory);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting commute ${
                id
                    ? 'history'
                    : accountId
                    ? 'history for given account id'
                    : 'histories'
            }`,
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
    const { accountId, fareAmount, commuteSystem, fareType, timestamp } =
        request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteHistoryQueries.createCommuteHistory,
            [accountId, fareAmount, commuteSystem, fareType, timestamp],
        );
        const commuteHistories = rows.map((commuteHistory) =>
            parseCommuteHistory(commuteHistory),
        );
        response.status(201).json(commuteHistories);
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
    const id = parseInt(request.params.id);
    const { accountId, fareAmount, commuteSystem, fareType, timestamp } =
        request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteHistoryQueries.getCommuteHistoryById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        const { rows: updateCommuteHistory } = await client.query(
            commuteHistoryQueries.updateCommuteHistory,
            [accountId, fareAmount, commuteSystem, fareType, timestamp, id],
        );

        const histories = updateCommuteHistory.map((history) =>
            parseCommuteHistory(history),
        );

        response.status(200).json(histories);
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
    const id = parseInt(request.params.id);

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteHistoryQueries.getCommuteHistoryById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        await client.query(commuteHistoryQueries.deleteCommuteHistory, [id]);

        response.status(200).send('Successfully deleted commute history');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting commute history');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
