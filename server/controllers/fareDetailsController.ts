import { type Request, type Response } from 'express';
import {
    commuteSystemQueries,
    fareDetailsQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type FareDetails } from '../types/types.js';
import { parseIntOrFallback } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';

interface FareDetailsInput {
    fare_detail_id: string;
    account_id: string;
    commute_system_id: string;
    system_name: string;
    fare_type: string;
    fare_amount: string;
    begin_in_effect_day_of_week: string;
    begin_in_effect_time: string;
    end_in_effect_day_of_week: string;
    end_in_effect_time: string;
    alternate_fare_detail_id: string | null;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param fareDetails - Fare details object to parse
 * @returns - Parsed fare details object
 */
const parseFareDetails = (fareDetails: FareDetailsInput): FareDetails => ({
    fare_detail_id: parseInt(fareDetails.fare_detail_id),
    account_id: parseInt(fareDetails.account_id),
    commute_system_id: parseInt(fareDetails.commute_system_id),
    system_name: fareDetails.system_name,
    fare_type: fareDetails.fare_type,
    fare_amount: parseFloat(fareDetails.fare_amount),
    begin_in_effect_day_of_week: parseInt(
        fareDetails.begin_in_effect_day_of_week,
    ),
    begin_in_effect_time: fareDetails.begin_in_effect_time,
    end_in_effect_day_of_week: parseInt(fareDetails.end_in_effect_day_of_week),
    end_in_effect_time: fareDetails.end_in_effect_time,
    alternate_fare_detail_id: parseIntOrFallback(
        fareDetails.alternate_fare_detail_id,
    ),
    date_created: fareDetails.date_created,
    date_modified: fareDetails.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all fare details or a single fare detail
 */
export const getFareDetails = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, account_id } = request.query as {
        id?: string;
        account_id?: string;
    }; // Destructure id from query string

    try {
        let query: string;
        let params: any[];

        // Change the query based on the presence of id
        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = fareDetailsQueries.getFareDetailsByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = fareDetailsQueries.getFareDetailsById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = fareDetailsQueries.getFareDetailsByAccountId;
            params = [account_id];
        } else {
            query = fareDetailsQueries.getFareDetails;
            params = [];
        }

        const fareDetails = await executeQuery<FareDetailsInput>(query, params);

        if (fareDetails.length === 0) {
            if (id !== null && id !== undefined) {
                response.status(404).send('Fare detail not found');
                return;
            } else if (account_id !== null && account_id !== undefined) {
                response.status(404).send('Fare detail not found');
                return;
            } else {
                response.status(200).json([]);
                return;
            }
        }

        const fareDetailsParsed = fareDetails.map(parseFareDetails);

        const responseObj: object = {
            fares: [
                fareDetailsParsed.map((fareDetail) => ({
                    account_id: fareDetail.account_id,
                    fare_detail_id: fareDetail.fare_detail_id,
                    commute_system: {
                        commute_system_id: fareDetail.commute_system_id,
                        name: fareDetail.system_name,
                    },
                    name: fareDetail.fare_type,
                    fare_amount: fareDetail.fare_amount,
                    begin_in_effect: {
                        day_of_week: fareDetail.begin_in_effect_day_of_week,
                        time: fareDetail.begin_in_effect_time,
                    },
                    end_in_effect: {
                        day_of_week: fareDetail.end_in_effect_day_of_week,
                        time: fareDetail.end_in_effect_time,
                    },
                    alternate_fare_detail_id:
                        fareDetailsParsed[0].alternate_fare_detail_id,
                    date_created: fareDetail.date_created,
                    date_modified: fareDetail.date_modified,
                })),
            ],
        };

        response.status(200).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting fare ${
                id !== null && id !== undefined
                    ? 'details for given id'
                    : account_id !== null && account_id !== undefined
                    ? 'details for given account_id'
                    : 'details'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created fare detail or an error message and posts the fare detail to the database
 */
export const createFareDetail = async (
    request: Request,
    response: Response,
) => {
    const {
        account_id,
        commute_system_id,
        name,
        fare_amount,
        begin_in_effect_day_of_week,
        begin_in_effect_time,
        end_in_effect_day_of_week,
        end_in_effect_time,
        alternate_fare_detail_id,
    } = request.body;

    try {
        const commuteSystemResults = await executeQuery(
            commuteSystemQueries.getCommuteSystemByAccountId,
            [account_id],
        );
        const hasCommuteSystem: boolean = commuteSystemResults.length > 0;

        if (hasCommuteSystem === false) {
            response.status(400).send({
                errors: {
                    msg: 'You need to create a commute system before creating a fare detail',
                    param: null,
                    location: 'query',
                },
            });
            return;
        }

        const rows = await executeQuery<FareDetailsInput>(
            fareDetailsQueries.createFareDetails,
            [
                account_id,
                commute_system_id,
                name,
                fare_amount,
                begin_in_effect_day_of_week,
                begin_in_effect_time,
                end_in_effect_day_of_week,
                end_in_effect_time,
                alternate_fare_detail_id,
            ],
        );
        const fareDetails = rows.map((fareDetail) =>
            parseFareDetails(fareDetail),
        );
        response.status(201).json(fareDetails);
    } catch (error) {
        if (
            error.message.includes(
                'alternate_fare_detail_id cannot be the same as fare_detail_id',
            )
        ) {
            response
                .status(400)
                .send(
                    'alternate_fare_detail_id cannot be the same as fare_detail_id',
                );
        } else {
            logger.error(error); // Log the error on the server side
            handleError(response, 'Error creating fare detail');
        }
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated fare detail or an error message and updates the fare detail in the database
 */
export const updateFareDetail = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const {
        account_id,
        commute_system_id,
        name,
        fare_amount,
        begin_in_effect_day_of_week,
        begin_in_effect_time,
        end_in_effect_day_of_week,
        end_in_effect_time,
        alternate_fare_detail_id,
    } = request.body;
    try {
        const fareDetails = await executeQuery<FareDetailsInput>(
            fareDetailsQueries.getFareDetailsById,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        const rows = await executeQuery<FareDetailsInput>(
            fareDetailsQueries.updateFareDetails,
            [
                account_id,
                commute_system_id,
                name,
                fare_amount,
                begin_in_effect_day_of_week,
                begin_in_effect_time,
                end_in_effect_day_of_week,
                end_in_effect_time,
                alternate_fare_detail_id,
            ],
        );
        const fareDetailsParsed = rows.map((fareDetail) =>
            parseFareDetails(fareDetail),
        );
        response.status(200).json(fareDetailsParsed);
    } catch (error) {
        if (
            error.message.includes(
                'alternate_fare_detail_id cannot be the same as fare_detail_id',
            )
        ) {
            response
                .status(400)
                .send(
                    'alternate_fare_detail_id cannot be the same as fare_detail_id',
                );
        } else {
            logger.error(error); // Log the error on the server side
            handleError(response, 'Error updating fare detail');
        }
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the fare detail from the database
 */
export const deleteFareDetail = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    try {
        const fareDetails = await executeQuery<FareDetailsInput>(
            fareDetailsQueries.getFareDetailsById,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        await executeQuery(fareDetailsQueries.deleteFareDetails, [id]);
        response.status(200).send('Successfully deleted fare detail');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting fare detail');
    }
};
