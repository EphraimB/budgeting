import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all taxes
 */
export const getTaxes = async (
    _: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM taxes
            `,
            [],
        );

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting taxes');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single tax
 */
export const getTaxesById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT *
                    FROM taxes
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const retreivedRow = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRow[0]);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting tax for id of ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the newly created tax
 */
export const createTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { rate, title, description, type } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                INSERT INTO taxes
                    (rate, title, description, type)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
            `,
            [rate, title, description, type],
        );

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated tax
 */
export const updateTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { rate, title, description, type } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM taxes
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const { rows: updateTaxesResults } = await client.query(
            `
                UPDATE taxes
                    SET rate = $1,
                    title = $2,
                    description = $3,
                    type = $4
                    WHERE id = $5
                    RETURNING *
            `,
            [rate, title, description, type, id],
        );

        const updatedRow = toCamelCase(updateTaxesResults[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a message indicating the tax was deleted
 */
export const deleteTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id
                    FROM taxes
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        await client.query(
            `
                DELETE FROM taxes
                    WHERE id = $1
            `,
            [id],
        );

        response.status(200).send('Successfully deleted tax');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
