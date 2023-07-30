import { Request, Response } from 'express';
import { taxesQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { Taxes } from '../types/types.js';

interface TaxesInput {
    tax_id: string;
    tax_amount: string;
    tax_title: string;
    tax_description: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param transactionHistory - Transaction history object
 * @returns Transaction history object with the correct types
 * Converts the transaction history object to the correct types
 */
const parseTaxes = (tax: TaxesInput): Taxes => ({
    tax_id: parseInt(tax.tax_id),
    tax_amount: parseFloat(tax.tax_amount),
    tax_title: tax.tax_title,
    tax_description: tax.tax_description,
    date_created: tax.date_created,
    date_modified: tax.date_modified
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all taxes or a single tax
 */
export const getTaxes = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.query;

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

        const taxesResults = await executeQuery<TaxesInput>(query, params);

        if ((id) && taxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const taxes: Taxes[] = taxesResults.map(tax => parseTaxes(tax));

        response.status(200).json(taxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'tax' : 'taxes'}`);
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the newly created tax
 */
export const createTax = async (request: Request, response: Response): Promise<void> => {
    const { amount, title, description } = request.body;

    try {
        const taxesResults = await executeQuery<TaxesInput>(
            taxesQueries.createTax,
            [amount, title, description]
        );

        const taxes: Taxes[] = taxesResults.map(transaction => parseTaxes(transaction));
        response.status(201).json(taxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating tax');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated tax
 */
export const updateTax = async (request: Request, response: Response): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const { amount, title, description } = request.body;

    try {
        const taxesResults = await executeQuery<TaxesInput>(
            taxesQueries.updateTax,
            [amount, title, description, id]
        );

        if (taxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        const taxes: Taxes[] = taxesResults.map(tax => parseTaxes(tax));

        response.status(200).json(taxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating tax');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a message indicating the tax was deleted
 */
export const deleteTax = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);

        const getTaxesResults = await executeQuery<TaxesInput>(taxesQueries.getTax, [id]);

        if (getTaxesResults.length === 0) {
            response.status(404).send('Tax not found');
            return;
        }

        await executeQuery(taxesQueries.deleteTax, [id]);

        response.status(200).send('Successfully deleted tax');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting tax');
    }
};
