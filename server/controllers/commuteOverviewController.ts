import { type Request, type Response } from 'express';
import { commuteOverviewQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all accounts or a single account
 */
export const getCommuteOverview = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { account_id } = request.query as { account_id?: string }; // Destructure id from query string

    try {
        // Change the query based on the presence of id
        const query: string = commuteOverviewQueries.getCommuteOverview;
        const params = [account_id];
        const overview = await executeQuery(query, params);

        if (overview.length === 0) {
            response.status(404).send('Account does not exist');
            return;
        }

        const returnObj = {};

        response.status(200).json(returnObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting commute overview for account ${account_id}`,
        );
    }
};
