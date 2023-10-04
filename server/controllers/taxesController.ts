import { type Request, type Response } from 'express';
import { taxesQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type Taxes } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param transactionHistory - Transaction history object
 * @returns Transaction history object with the correct types
 * Converts the transaction history object to the correct types
 */
const parseTaxes = (tax: Record<string, string>): Taxes => ({
    tax_id: parseInt(tax.tax_id),
    tax_rate: parseFloat(tax.tax_rate),
    tax_title: tax.tax_title,
    tax_description: tax.tax_description,
    tax_type: parseInt(tax.tax_type),
    date_created: tax.date_created,
    date_modified: tax.date_modified,
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

    try {
        let query: string;
        let params: any[];

        if (id !== null && id !== undefined) {
            query = taxesQueries.getTax;
            params = [id];
        } else {
            query = taxesQueries.getTaxes;
            params = [];
        }

        const taxesResults = await executeQuery(query, params);

        if (id !== null && id !== undefined && taxesResults.length === 0) {
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

    try {
        const taxesResults = await executeQuery(taxesQueries.createTax, [
            rate,
            title,
            description,
            type,
        ]);

        const taxes: Taxes[] = taxesResults.map((transaction) =>
            parseTaxes(transaction),
        );
        response.status(201).json(taxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating tax');
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

    try {
        const taxesResults = await executeQuery(taxesQueries.updateTax, [
            rate,
            title,
            description,
            type,
            id,
        ]);

        if (taxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const taxes: Taxes[] = taxesResults.map((tax) => parseTaxes(tax));

        response.status(200).json(taxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating tax');
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
    try {
        const id: number = parseInt(request.params.id);

        const getTaxesResults = await executeQuery(taxesQueries.getTax, [id]);

        if (getTaxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        await executeQuery(taxesQueries.deleteTax, [id]);

        response.status(200).send('Successfully deleted tax');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting tax');
    }
};
