import { type Request, type Response } from 'express';
import { commuteOverviewQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';

type ReturnObject = {
    account_id: number;
    total_cost_per_week: number;
    total_cost_per_month: number;
    systems: {
        [key: string]: {
            total_cost_per_week: number;
            total_cost_per_month: number;
            rides: number;
            fare_cap_progress?: {
                current_spent: number;
                fare_cap: number;
                potential_savings: number;
                fare_cap_duration: number;
            };
        };
    };
};

type SystemDetails = {
    total_cost_per_week: number;
    total_cost_per_month: number;
    rides: number;
    fare_cap_progress?: {
        current_spent: number;
        fare_cap: number;
        potential_savings: number;
        fare_cap_duration: number;
    };
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single account
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

        // Initialize the return object
        const returnObject: ReturnObject = {
            account_id: 1, // set the account_id
            total_cost_per_week: 0,
            total_cost_per_month: 0,
            systems: {},
        };

        // Loop through the query result and build the return object
        overview.forEach((row) => {
            // Update the total_cost_per_week and total_cost_per_month
            returnObject.total_cost_per_week += parseFloat(
                row.total_cost_per_week,
            );
            returnObject.total_cost_per_month += parseFloat(
                row.total_cost_per_month,
            );

            // Initialize systemDetails object
            const systemDetails: SystemDetails = {
                total_cost_per_week: parseFloat(row.total_cost_per_week),
                total_cost_per_month: parseFloat(row.total_cost_per_month),
                rides: parseInt(row.rides),
            };

            // Include fare_cap_progress if fare_cap is not null
            if (row.fare_cap !== null) {
                systemDetails.fare_cap_progress = {
                    current_spent: parseFloat(row.current_spent),
                    fare_cap: parseFloat(row.fare_cap),
                    potential_savings:
                        parseFloat(row.fare_cap) -
                        parseFloat(row.current_spent),
                    fare_cap_duration: parseInt(row.fare_cap_duration),
                };
            }

            // Add the systemDetails to the return object
            returnObject.systems[row.system_name] = systemDetails;
        });

        response.status(200).json(returnObject);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting commute overview for account ${account_id}`,
        );
    }
};
