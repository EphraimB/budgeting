import { type Request, type Response } from 'express';
import { commuteSystemQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type CommuteSystem } from '../types/types.js';
import { logger } from '../config/winston.js';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../utils/helperFunctions.js';
import pool from '../config/db.js';

/**
 *
 * @param commuteSystem - Commute system object to parse
 * @returns - Parsed commute system object
 */
const parseCommuteSystem = (
    commuteSystem: Record<string, string>,
): CommuteSystem => ({
    id: parseInt(commuteSystem.commute_system_id),
    name: commuteSystem.name,
    fareCap: parseFloatOrFallback(commuteSystem.fare_cap),
    fareCapDuration: parseIntOrFallback(commuteSystem.fare_cap_duration),
    dateCreated: commuteSystem.date_created,
    dateModified: commuteSystem.date_modified,
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        // Change the query based on the presence of id
        if (id) {
            query = commuteSystemQueries.getCommuteSystemById;
            params = [id];
        } else {
            query = commuteSystemQueries.getCommuteSystems;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const commuteSystems = rows.map((commuteSystem) =>
            parseCommuteSystem(commuteSystem),
        );

        response.status(200).json(commuteSystems);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${id ? 'system with id ' + id : 'systems'}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
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
    const { name, fareCap, fareCapDuration } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteSystemQueries.createCommuteSystem,
            [name, fareCap, fareCapDuration],
        );
        const commuteSystem = rows.map((cs) => parseCommuteSystem(cs));

        response.status(201).json(commuteSystem);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating system');
    } finally {
        client.release(); // Release the client back to the pool
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
    const { name, fareCap, fareCapDuration } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteSystemQueries.getCommuteSystemById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const { rows: updateCommuteSystem } = await client.query(
            commuteSystemQueries.updateCommuteSystem,
            [name, fareCap, fareCapDuration, id],
        );
        const system = updateCommuteSystem.map((s) => parseCommuteSystem(s));

        response.status(200).json(system);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating system');
    } finally {
        client.release(); // Release the client back to the pool
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteSystemQueries.getCommuteSystemById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        await client.query(commuteSystemQueries.deleteCommuteSystem, [id]);

        response.status(200).send('Successfully deleted system');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting system');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
