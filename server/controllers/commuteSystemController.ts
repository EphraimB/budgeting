import { type Request, type Response } from 'express';
import { commuteSystemQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteSystem } from '../types/types.js';
import { logger } from '../config/winston.js';

interface CommuteSystemInput {
    commute_system_id: string;
    name: string;
    fare_cap: string;
    fare_cap_duration: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param commuteSystem - Commute system object to parse
 * @returns - Parsed commute system object
 */
const parseCommuteSystem = (
    commuteSystem: CommuteSystemInput,
): CommuteSystem => ({
    commute_system_id: parseInt(commuteSystem.commute_system_id),
    name: commuteSystem.name,
    fare_cap: parseFloat(commuteSystem.fare_cap),
    fare_cap_duration: parseInt(commuteSystem.fare_cap_duration),
    date_created: commuteSystem.date_created,
    date_modified: commuteSystem.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute systems or a single system
 */
export const getCommuteSystem = async (
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
            query = commuteSystemQueries.getCommuteSystemByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = commuteSystemQueries.getCommuteSystemById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = commuteSystemQueries.getCommuteSystemByAccountId;
            params = [account_id];
        } else {
            query = commuteSystemQueries.getCommuteSystems;
            params = [];
        }

        const commuteSystem = await executeQuery<CommuteSystemInput>(
            query,
            params,
        );

        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined &&
            commuteSystem.length === 0
        ) {
            response.status(404).send('System not found');
            return;
        }

        response.status(200).json(commuteSystem.map(parseCommuteSystem));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined ? 'system' : 'systems'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created system or an error message and posts the system to the database
 */
export const createCommuteSystem = async (
    request: Request,
    response: Response,
) => {
    const { name, fare_cap, fare_cap_duration } = request.body;

    try {
        const rows = await executeQuery<CommuteSystemInput>(
            commuteSystemQueries.createCommuteSystem,
            [name, fare_cap, fare_cap_duration],
        );
        const commuteSystem = rows.map((cs) => parseCommuteSystem(cs));
        response.status(201).json(commuteSystem);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating system');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated system or an error message and updates the system in the database
 */
export const updateSystem = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const { name, fare_cap, fare_cap_duration } = request.body;
    try {
        const commuteSystem = await executeQuery<CommuteSystemInput>(
            commuteSystemQueries.getCommuteSystemById,
            [id],
        );

        if (commuteSystem.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const rows = await executeQuery<CommuteSystemInput>(
            commuteSystemQueries.updateCommuteSystem,
            [name, fare_cap, fare_cap_duration, id],
        );
        const system = rows.map((s) => parseCommuteSystem(s));
        response.status(200).json(system);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating system');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the system from the database
 */
export const deleteCommuteSystem = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    try {
        const commuteSystem = await executeQuery<CommuteSystemInput>(
            commuteSystemQueries.getCommuteSystemById,
            [id],
        );

        if (commuteSystem.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        await executeQuery(commuteSystemQueries.deleteCommuteSystem, [id]);
        response.status(200).send('Successfully deleted system');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting system');
    }
};
