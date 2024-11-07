import { type Request, type Response } from 'express';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';
import { handleError, toCamelCase } from '../../src/utils/helperFunctions.js';

/**
 *
 * @param response - Response object
 * Sends a response with all stations
 */
export const getStations = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { commuteSystemId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (commuteSystemId) {
            query = `
                SELECT *
                    FROM stations
                    WHERE commute_system_id = $1
            `;
            params = [commuteSystemId];
        } else {
            query = `
                SELECT *
                    FROM stations
            `;
            params = [];
        }
        const { rows } = await client.query(query, params);
        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting stations');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single station
 */
export const getStationById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { commuteSystemId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (commuteSystemId) {
            query = `
                SELECT *
                    FROM commute_systems
                    WHERE id = $1 AND commute_system_id = $2
            `;
            params = [id, commuteSystemId];
        } else {
            query = `
                SELECT *
                    FROM commute_systems
                    WHERE id = $1
            `;
            params = [id];
        }
        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Station not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting station with id for ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created station or an error message and posts the station to the database
 */
export const createStation = async (request: Request, response: Response) => {
    const { commuteSystemId, fromStation, toStation, tripDuration } =
        request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                INSERT INTO stations
                (commute_system_id, from_station, to_station, trip_duration)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `,
            [commuteSystemId, fromStation, toStation, tripDuration],
        );

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating station');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated station or an error message and updates the station in the database
 */
export const updateStation = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { commuteSystemId, fromStation, toStation, tripDuration } =
        request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM stations
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Station not found');
            return;
        }

        const { rows: updateStation } = await client.query(
            `
                UPDATE stations
                    SET commute_system_id = $1,
                    from_station = $2,
                    to_station = $3
                    trip_duration = $4
                    WHERE id = $5
                    RETURNING *
            `,
            [commuteSystemId, fromStation, toStation, tripDuration, id],
        );

        const updatedRow = toCamelCase(updateStation[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating station');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the station from the database
 */
export const deleteStation = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM stations
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Station not found');
            return;
        }

        await client.query(
            `
                DELETE FROM stations
                    WHERE id = $1
            `,
            [id],
        );

        response.status(200).send('Successfully deleted station');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting station');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
