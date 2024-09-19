import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute systems
 */
export const getCommuteSystem = async (
    _: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM commute_systems
            `,
            [],
        );

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting systems');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single system
 */
export const getCommuteSystemById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM commute_systems
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const retreivedRow = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting system with id for ${id}`);
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
            `
                INSERT INTO commute_systems
                (name, fare_cap, fare_cap_duration)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
            [name, fareCap, fareCapDuration],
        );

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
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
    const { id } = request.params;
    const { name, fareCap, fareCapDuration } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM commute_systems
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        const { rows: updateCommuteSystem } = await client.query(
            `
                UPDATE commute_systems
                    SET name = $1,
                    fare_cap = $2,
                    fare_cap_duration = $3
                    WHERE id = $4
                    RETURNING *
            `,
            [name, fareCap, fareCapDuration, id],
        );

        const updatedRow = toCamelCase(updateCommuteSystem[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
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
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM commute_systems
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('System not found');
            return;
        }

        await client.query(
            `
                DELETE FROM commute_systems
                    WHERE id = $1
            `,
            [id],
        );

        response.status(200).send('Successfully deleted system');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting system');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
