import { type Request, type Response } from 'express';
import {
    commuteSystemQueries,
    fareDetailsQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteSystem } from '../types/types.js';
import { logger } from '../config/winston.js';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../utils/helperFunctions.js';

/**
 *
 * @param commuteSystem - Commute system object to parse
 * @returns - Parsed commute system object
 */
const parseCommuteSystem = (
    commuteSystem: Record<string, string>,
): CommuteSystem => ({
    commute_system_id: parseInt(commuteSystem.commute_system_id),
    name: commuteSystem.name,
    fare_cap: parseFloatOrFallback(commuteSystem.fare_cap),
    fare_cap_duration: parseIntOrFallback(commuteSystem.fare_cap_duration),
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
    const { id } = request.query as {
        id?: string;
    }; // Destructure id from query string

    try {
        let query: string;
        let params: any[];

        // Change the query based on the presence of id
        if (id !== null && id !== undefined) {
            query = commuteSystemQueries.getCommuteSystemById;
            params = [id];
        } else {
            query = commuteSystemQueries.getCommuteSystems;
            params = [];
        }

        const commuteSystem = await executeQuery(query, params);

        if (id !== null && id !== undefined && commuteSystem.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        response.status(200).json(commuteSystem.map(parseCommuteSystem));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'system with id ' + id
                    : 'systems'
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
        const rows = await executeQuery(
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
export const updateCommuteSystem = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const { name, fare_cap, fare_cap_duration } = request.body;
    try {
        const commuteSystem = await executeQuery(
            commuteSystemQueries.getCommuteSystemById,
            [id],
        );

        if (commuteSystem.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const rows = await executeQuery(
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
        const commuteSystem = await executeQuery(
            commuteSystemQueries.getCommuteSystemById,
            [id],
        );

        if (commuteSystem.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const fareDetailsResults = await executeQuery(
            fareDetailsQueries.getFareDetails,
            [],
        );
        const hasFareDetails: boolean = fareDetailsResults.length > 0;

        if (hasFareDetails) {
            response
                .status(400)
                .send(
                    'You need to delete system-related data before deleting the system',
                );
            return;
        }

        await executeQuery(commuteSystemQueries.deleteCommuteSystem, [id]);
        response.status(200).send('Successfully deleted system');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting system');
    }
};
