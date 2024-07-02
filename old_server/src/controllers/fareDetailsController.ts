import { type Request, type Response } from 'express';
import {
    commuteSystemQueries,
    fareDetailsQueries,
    fareTimeslotsQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type Timeslots } from '../types/types.js';
import { parseIntOrFallback } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';

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
    const { id } = request.query as {
        id?: string;
    }; // Destructure id from query string

    try {
        let query: string;
        let queryTwo: string;
        let params: any[];

        // Change the query based on the presence of id
        if (id) {
            query = fareDetailsQueries.getFareDetailsById;
            queryTwo = fareTimeslotsQueries.getTimeslotsByFareId;
            params = [id];
        } else {
            query = fareDetailsQueries.getFareDetails;
            queryTwo = fareTimeslotsQueries.getTimeslots;
            params = [];
        }

        const fareDetails = await executeQuery(query, params);

        if (fareDetails.length === 0) {
            if (id) {
                response.status(404).send('Fare detail not found');
                return;
            } else {
                response.status(200).json([]);
                return;
            }
        }

        const timeslots = await executeQuery(queryTwo, params);

        const responseObj: object = {
            fares: fareDetails.map((fareDetail) => ({
                id: parseInt(fareDetail.fare_detail_id),
                commute_system: {
                    commute_system_id: fareDetail.commute_system_id,
                    name: fareDetail.system_name,
                },
                name: fareDetail.fare_type,
                fare_amount: parseFloat(fareDetail.fare_amount),
                timeslots: timeslots
                    .filter(
                        (ts) => ts.fare_detail_id === fareDetail.fare_detail_id,
                    )
                    .map((timeslot) => ({
                        day_of_week: parseInt(timeslot.day_of_week),
                        start_time: timeslot.start_time,
                        end_time: timeslot.end_time,
                    })),
                alternate_fare_detail_id: parseIntOrFallback(
                    fareDetail.alternate_fare_detail_id,
                ),
                date_created: fareDetail.date_created,
                date_modified: fareDetail.date_modified,
            })),
        };

        response.status(200).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting fare ${id ? 'details for given id' : 'details'}`,
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
        commute_system_id,
        name,
        fare_amount,
        timeslots,
        duration,
        day_start,
        alternate_fare_detail_id,
    } = request.body;

    try {
        const commuteSystemResults = await executeQuery(
            commuteSystemQueries.getCommuteSystemById,
            [commute_system_id],
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

        const fareDetails = await executeQuery(
            fareDetailsQueries.createFareDetails,
            [
                commute_system_id,
                name,
                fare_amount,
                duration,
                day_start,
                alternate_fare_detail_id,
            ],
        );

        const timeslotPromises = timeslots.map(async (timeslot: Timeslots) => {
            const timeslotData = await executeQuery(
                fareTimeslotsQueries.createTimeslot,
                [
                    fareDetails[0].fare_detail_id,
                    timeslot.day_of_week,
                    timeslot.start_time,
                    timeslot.end_time,
                ],
            );

            return {
                day_of_week: parseInt(timeslotData[0].day_of_week),
                start_time: timeslotData[0].start_time,
                end_time: timeslotData[0].end_time,
            };
        });

        const allTimeslots: Timeslots[] = await Promise.all(timeslotPromises);

        const responseObj: object = {
            id: fareDetails[0].fare_detail_id,
            commute_system: {
                commute_system_id: fareDetails[0].commute_system_id,
                name: commuteSystemResults[0].name,
            },
            name: fareDetails[0].fare_type,
            fare_amount: parseFloat(fareDetails[0].fare_amount),
            timeslots: allTimeslots,
            duration: fareDetails[0].duration,
            day_start: fareDetails[0].day_start,
            alternate_fare_detail_id: fareDetails[0].alternate_fare_detail_id,
            date_created: fareDetails[0].date_created,
            date_modified: fareDetails[0].date_modified,
        };

        response.status(201).json(responseObj);
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
 * @param current - Current timeslots
 * @param incoming - Incoming timeslots
 * @returns Object containing timeslots to insert, delete, and update
 */
export const compareTimeslots = (
    current: Timeslots[],
    incoming: Timeslots[],
) => {
    let toInsert = [];
    let toDelete = [];
    let toUpdate = [];

    const currentMap = new Map();
    const incomingMap = new Map();

    // Create a map from the current timeslots
    for (let slot of current) {
        const key = `${slot.day_of_week}-${slot.start_time}-${slot.end_time}`;
        currentMap.set(key, slot);
    }

    // Create a map from the incoming timeslots
    for (let slot of incoming) {
        const key = `${slot.day_of_week}-${slot.start_time}-${slot.end_time}`;
        incomingMap.set(key, slot);
    }

    // Identify new and modified timeslots
    for (let [key, slot] of incomingMap) {
        if (!currentMap.has(key)) {
            toInsert.push(slot);
        } else {
            const currentSlot = currentMap.get(key);
            if (JSON.stringify(currentSlot) !== JSON.stringify(slot)) {
                toUpdate.push(slot);
            }
        }
    }

    // Identify deleted timeslots
    for (let key of currentMap.keys()) {
        if (!incomingMap.has(key)) {
            toDelete.push(currentMap.get(key));
        }
    }

    return {
        toInsert,
        toDelete,
        toUpdate,
    };
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
        commute_system_id,
        name,
        fare_amount,
        timeslots,
        duration,
        day_start,
        alternate_fare_detail_id,
    } = request.body;
    try {
        const fareDetails = await executeQuery(
            fareDetailsQueries.getFareDetailsById,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        const currentTimeslots = await executeQuery(
            fareTimeslotsQueries.getTimeslotsByFareId,
            [id],
        );

        const { toInsert, toDelete, toUpdate } = compareTimeslots(
            currentTimeslots,
            timeslots,
        );

        toDelete.forEach(async (timeslot) => {
            await executeQuery(fareTimeslotsQueries.deleteTimeslot, [
                timeslot.timeslot_id,
            ]);
        });

        toInsert.forEach(async (timeslot) => {
            await executeQuery(fareTimeslotsQueries.createTimeslot, [
                id,
                timeslot.day_of_week,
                timeslot.start_time,
                timeslot.end_time,
            ]);
        });

        await executeQuery(fareDetailsQueries.updateFareDetails, [
            commute_system_id,
            name,
            fare_amount,
            duration,
            day_start,
            alternate_fare_detail_id,
            id,
        ]);

        const [{ name: systemName }] = await executeQuery(
            commuteSystemQueries.getCommuteSystemById,
            [commute_system_id],
        );

        const responseObj: object = {
            id: fareDetails[0].fare_detail_id,
            commute_system: {
                commute_system_id: fareDetails[0].commute_system_id,
                name: systemName,
            },
            name: fareDetails[0].fare_type,
            fare_amount: parseFloat(fareDetails[0].fare_amount),
            timeslots: timeslots,
            duration: fareDetails[0].duration,
            day_start: fareDetails[0].day_start,
            alternate_fare_detail_id: fareDetails[0].alternate_fare_detail_id,
            date_created: fareDetails[0].date_created,
            date_modified: fareDetails[0].date_modified,
        };

        response.status(200).json(responseObj);
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
        const fareDetails = await executeQuery(
            fareDetailsQueries.getFareDetailsById,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        await executeQuery(fareTimeslotsQueries.deleteTimeslotByFareId, [id]);
        await executeQuery(fareDetailsQueries.deleteFareDetails, [id]);

        response.status(200).send('Successfully deleted fare detail');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting fare detail');
    }
};
