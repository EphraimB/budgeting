import { type Request, type Response } from 'express';
import { commuteHistoryQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteHistory } from '../types/types.js';
import { logger } from '../config/winston.js';

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
    commute_history_id: parseInt(commuteHistory.commute_history_id),
    account_id: parseInt(commuteHistory.account_id),
    fare_amount: parseFloat(commuteHistory.fare_amount),
    commute_system: commuteHistory.commute_system,
    fare_type: commuteHistory.fare_type,
    timestamp: commuteHistory.timestamp,
    date_created: commuteHistory.date_created,
    date_modified: commuteHistory.date_modified,
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
    const { id, account_id } = request.query as {
        id?: string;
        account_id?: string;
    }; // Destructure id from query string

    try {
        let query: string;
        let params: any[];

        // Change the query based on the presence of id
        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = commuteHistoryQueries.getCommuteHistoryByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = commuteHistoryQueries.getCommuteHistoryById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = commuteHistoryQueries.getCommuteHistoryByAccountId;
            params = [account_id];
        } else {
            query = commuteHistoryQueries.getCommuteHistory;
            params = [];
        }

        const commuteHistory = await executeQuery<CommuteHistoryInput>(
            query,
            params,
        );

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            commuteHistory.length === 0
        ) {
            response.status(404).send('Commute history not found');
            return;
        }

        response.status(200).json(commuteHistory.map(parseCommuteHistory));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting commute ${
                id !== null && id !== undefined
                    ? 'history'
                    : account_id !== null && account_id !== undefined
                    ? 'history for given account_id'
                    : 'histories'
            }`,
        );
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
    const { account_id, fare_amount, commute_system, fare_type, timestamp } =
        request.body;

    try {
        const rows = await executeQuery<CommuteHistoryInput>(
            commuteHistoryQueries.createCommuteHistory,
            [account_id, fare_amount, commute_system, fare_type, timestamp],
        );
        const commuteHistories = rows.map((commuteHistory) =>
            parseCommuteHistory(commuteHistory),
        );
        response.status(201).json(commuteHistories);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating commute history');
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
    const { account_id, fare_amount, commute_system, fare_type, timestamp } =
        request.body;
    try {
        const commuteHistory = await executeQuery<CommuteHistoryInput>(
            commuteHistoryQueries.getCommuteHistoryById,
            [id],
        );

        if (commuteHistory.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        const rows = await executeQuery<CommuteHistoryInput>(
            commuteHistoryQueries.updateCommuteHistory,
            [account_id, fare_amount, commute_system, fare_type, timestamp, id],
        );
        const histories = rows.map((history) => parseCommuteHistory(history));
        response.status(200).json(histories);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating commute history');
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
    try {
        const commuteHistory = await executeQuery<CommuteHistoryInput>(
            commuteHistoryQueries.getCommuteHistoryById,
            [id],
        );

        if (commuteHistory.length === 0) {
            response.status(404).send('Commute history not found');
            return;
        }

        await executeQuery(commuteHistoryQueries.deleteCommuteHistory, [id]);
        response.status(200).send('Successfully deleted commute history');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting commute history');
    }
};
