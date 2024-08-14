import { type Request, type Response } from 'express';
import { taxesQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type Taxes } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param transactionHistory - Transaction history object
 * @returns Transaction history object with the correct types
 * Converts the transaction history object to the correct types
 */
const parseTaxes = (tax: Record<string, string>): Taxes => ({
    id: parseInt(tax.tax_id),
    rate: parseFloat(tax.tax_rate),
    title: tax.tax_title,
    description: tax.tax_description,
    type: parseInt(tax.tax_type),
    dateCreated: tax.date_created,
    dateModified: tax.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all taxes or a single tax
 */
export const getTaxes = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id) {
            query = taxesQueries.getTax;
            params = [id];
        } else {
            query = taxesQueries.getTaxes;
            params = [];
        }

        const { rows: taxesResults } = await client.query(query, params);

        if (id && taxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const taxes: Taxes[] = taxesResults.map((tax) => parseTaxes(tax));

        response.status(200).json(taxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined ? 'tax' : 'taxes'
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
 * Sends a response with the newly created tax
 */
export const createTax = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { rate, title, description, type } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: taxesResults } = await client.query(
            taxesQueries.createTax,
            [rate, title, description, type],
        );

        const taxes: Taxes[] = taxesResults.map((transaction) =>
            parseTaxes(transaction),
        );
        response.status(201).json(taxes);
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
    const id: number = parseInt(request.params.id);
    const { rate, title, description, type } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: taxesResults } = await client.query(
            taxesQueries.updateTax,
            [rate, title, description, type, id],
        );

        if (taxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const taxes: Taxes[] = taxesResults.map((tax) => parseTaxes(tax));

        response.status(200).json(taxes);
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
    const id: number = parseInt(request.params.id);

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: getTaxesResults } = await client.query(
            taxesQueries.getTax,
            [id],
        );

        if (getTaxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        await client.query(taxesQueries.deleteTax, [id]);

        response.status(200).send('Successfully deleted tax');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting tax');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
