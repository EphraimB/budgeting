import { type Request, type Response } from 'express';
import {
    commuteSystemQueries,
    fareDetailsQueries,
    fareTimeslotsQueries,
} from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type Timeslots } from '../types/types.js';
import { parseIntOrFallback } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

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

    const client = await pool.connect(); // Get a client from the pool

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

        const { rows: fareDetails } = await client.query(query, params);

        if (fareDetails.length === 0) {
            if (id) {
                response.status(404).send('Fare detail not found');
                return;
            } else {
                response.status(200).json([]);
                return;
            }
        }

        const { rows: timeslots } = await client.query(queryTwo, params);

        const responseObj: object = {
            fares: fareDetails.map((fareDetail) => ({
                id: parseInt(fareDetail.fare_detail_id),
                commuteSystem: {
                    commuteSystemId: fareDetail.commute_system_id,
                    name: fareDetail.system_name,
                },
                name: fareDetail.fare_type,
                fareAmount: parseFloat(fareDetail.fare_amount),
                timeslots: timeslots
                    .filter(
                        (ts) => ts.fare_detail_id === fareDetail.fare_detail_id,
                    )
                    .map((timeslot) => ({
                        dayOfWeek: parseInt(timeslot.day_of_week),
                        startTime: timeslot.start_time,
                        endTime: timeslot.end_time,
                    })),
                alternateFareDetailId: parseIntOrFallback(
                    fareDetail.alternate_fare_detail_id,
                ),
                dateCreated: fareDetail.date_created,
                dateModified: fareDetail.date_modified,
            })),
        };

        response.status(200).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting fare ${id ? 'details for given id' : 'details'}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
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
        commuteSystemId,
        name,
        fareAmount,
        timeslots,
        duration,
        dayStart,
        alternateFareDetailId,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: commuteSystemResults } = await client.query(
            commuteSystemQueries.getCommuteSystemById,
            [commuteSystemId],
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

        await client.query('BEGIN;');

        const { rows: fareDetails } = await client.query(
            fareDetailsQueries.createFareDetails,
            [
                commuteSystemId,
                name,
                fareAmount,
                duration,
                dayStart,
                alternateFareDetailId,
            ],
        );

        const timeslotPromises = timeslots.map(async (timeslot: Timeslots) => {
            const { rows: timeslotData } = await client.query(
                fareTimeslotsQueries.createTimeslot,
                [
                    fareDetails[0].fare_detail_id,
                    timeslot.dayOfWeek,
                    timeslot.startTime,
                    timeslot.endTime,
                ],
            );

            return {
                day_of_week: parseInt(timeslotData[0].day_of_week),
                start_time: timeslotData[0].start_time,
                end_time: timeslotData[0].end_time,
            };
        });

        const allTimeslots: Timeslots[] = await Promise.all(timeslotPromises);

        await client.query('COMMIT;');

        const responseObj: object = {
            id: fareDetails[0].fare_detail_id,
            commuteSystem: {
                commuteSystemId: fareDetails[0].commute_system_id,
                name: commuteSystemResults[0].name,
            },
            name: fareDetails[0].fare_type,
            fareAmount: parseFloat(fareDetails[0].fare_amount),
            timeslots: allTimeslots,
            duration: fareDetails[0].duration,
            dayStart: fareDetails[0].day_start,
            alternateFareDetailId: fareDetails[0].alternate_fare_detail_id,
            dateCreated: fareDetails[0].date_created,
            dateModified: fareDetails[0].date_modified,
        };

        response.status(201).json(responseObj);
    } catch (error) {
        if (
            error.message.includes(
                'alternate fare detail id cannot be the same as fare detail id',
            )
        ) {
            response
                .status(400)
                .send(
                    'alternate fare detail id cannot be the same as fare detail id',
                );
        } else {
            await client.query('ROLLBACK;');

            logger.error(error); // Log the error on the server side
            handleError(response, 'Error creating fare detail');
        }
    } finally {
        client.release(); // Release the client back to the pool
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
        const key = `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
        currentMap.set(key, slot);
    }

    // Create a map from the incoming timeslots
    for (let slot of incoming) {
        const key = `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
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
        commuteSystemId,
        name,
        fareAmount,
        timeslots,
        duration,
        dayStart,
        alternateFareDetailId,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: fareDetails } = await client.query(
            fareDetailsQueries.getFareDetailsById,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        const { rows: currentTimeslots } = await client.query(
            fareTimeslotsQueries.getTimeslotsByFareId,
            [id],
        );

        const { toInsert, toDelete, toUpdate } = compareTimeslots(
            currentTimeslots,
            timeslots,
        );

        await client.query('BEGIN;');

        toDelete.forEach(async (timeslot) => {
            await client.query(fareTimeslotsQueries.deleteTimeslot, [
                timeslot.timeslot_id,
            ]);
        });

        toInsert.forEach(async (timeslot) => {
            await client.query(fareTimeslotsQueries.createTimeslot, [
                id,
                timeslot.day_of_week,
                timeslot.start_time,
                timeslot.end_time,
            ]);
        });

        await client.query(fareDetailsQueries.updateFareDetails, [
            commuteSystemId,
            name,
            fareAmount,
            duration,
            dayStart,
            alternateFareDetailId,
            id,
        ]);

        await client.query('COMMIT;');

        const { rows: commuteSystemResults } = await client.query(
            commuteSystemQueries.getCommuteSystemById,
            [commuteSystemId],
        );

        const systemName = commuteSystemResults[0].name;

        const responseObj: object = {
            id: fareDetails[0].fare_detail_id,
            commuteSystem: {
                commuteSystemId: fareDetails[0].commute_system_id,
                name: systemName,
            },
            name: fareDetails[0].fare_type,
            fareAmount: parseFloat(fareDetails[0].fare_amount),
            timeslots: timeslots,
            duration: fareDetails[0].duration,
            dayStart: fareDetails[0].day_start,
            alternateFareDetailId: fareDetails[0].alternate_fare_detail_id,
            dateCreated: fareDetails[0].date_created,
            dateModified: fareDetails[0].date_modified,
        };

        response.status(200).json(responseObj);
    } catch (error) {
        if (
            error.message.includes(
                'alternate fare detail id cannot be the same as fare detail id',
            )
        ) {
            response
                .status(400)
                .send(
                    'alternate fare detail id cannot be the same as fare detail id',
                );
        } else {
            await client.query('ROLLBACK;');

            logger.error(error); // Log the error on the server side
            handleError(response, 'Error updating fare detail');
        }
    } finally {
        client.release(); // Release the client back to the pool
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: fareDetails } = await client.query(
            fareDetailsQueries.getFareDetailsById,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(fareTimeslotsQueries.deleteTimeslotByFareId, [id]);
        await client.query(fareDetailsQueries.deleteFareDetails, [id]);

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted fare detail');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting fare detail');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
