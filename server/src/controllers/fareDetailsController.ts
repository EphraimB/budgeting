import { type Request, type Response } from 'express';
import {
    compareTimeslots,
    handleError,
    toCamelCase,
} from '../utils/helperFunctions.js';
import { type Timeslots } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param response - Response object
 * Sends a response with all fare details
 */
export const getFareDetails = async (
    _: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT
                    fare_details.account_id,
                    fare_details.id,
                    commute_systems.id AS commute_system_id, commute_systems.name AS commute_system_name,
                    fare_details.name, 
                    fare, 
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'day_of_week', timeslots.day_of_week,
                                'start_time', timeslots.start_time,
                                'end_time', timeslots.end_time
                            )::json
                        ) FILTER (WHERE timeslots.id IS NOT NULL), 
                        '[]'::json
                    ) AS timeslots, 
                    alternate_fare_details_id, 
                    fare_details.date_created, 
                    fare_details.date_modified
                FROM 
                    fare_details
                LEFT JOIN 
                    timeslots ON timeslots.fare_details_id = fare_details.id
                LEFT JOIN stations ON fare_details.station_id = stations.id
                LEFT JOIN 
                    commute_systems ON stations.commute_system_id = commute_systems.id
                GROUP BY 
                    fare_details.id, commute_systems.id;
            `,
            [],
        );

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting fare details');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single fare detail
 */
export const getFareDetailsById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT
                    fare_details.account_id,
                    fare_details.id,
                    commute_systems.id AS commute_system_id, commute_systems.name AS commute_system_name,
                    fare_details.name, 
                    fare, 
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'day_of_week', timeslots.day_of_week,
                                'start_time', timeslots.start_time,
                                'end_time', timeslots.end_time
                            )::json
                        ) FILTER (WHERE timeslots.id IS NOT NULL), 
                        '[]'::json
                    ) AS timeslots, 
                    alternate_fare_details_id, 
                    fare_details.date_created, 
                    fare_details.date_modified
                FROM 
                    fare_details
                LEFT JOIN 
                    timeslots ON timeslots.fare_details_id = fare_details.id
                LEFT JOIN stations ON fare_details.station_id = stations.id
                LEFT JOIN 
                    commute_systems ON stations.commute_system_id = commute_systems.id
                WHERE fare_details.id = $1
                GROUP BY 
                    fare_details.id, commute_systems.id;
            `,
            [],
        );

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting fare details for id of ${id}`);
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
        stationId,
        accountId,
        name,
        fare,
        timeslots,
        duration,
        dayStart,
        alternateFareDetailsId,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: commuteSystemResults } = await client.query(
            `
                SELECT csy.id, csy.name
                    FROM stations s
                    LEFT JOIN commute_systems csy ON s.commute_system_id = csy.id
                    WHERE s.id = $1
            `,
            [stationId],
        );

        if (commuteSystemResults.length === 0) {
            response
                .status(400)
                .send(
                    'You need to create a commute system before creating a fare detail',
                );

            return;
        }

        await client.query('BEGIN;');

        const { rows: fareDetails } = await client.query(
            `
                INSERT INTO fare_details
                (station_id, account_id, name, fare, duration, day_start, alternate_fare_details_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `,
            [
                stationId,
                accountId,
                name,
                fare,
                duration,
                dayStart,
                alternateFareDetailsId,
            ],
        );

        const timeslotPromises = timeslots.map(async (timeslot: Timeslots) => {
            const { rows: timeslotData } = await client.query(
                `
                    INSERT INTO timeslots
                    (fare_details_id, day_of_week, start_time, end_time)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `,
                [
                    fareDetails[0].id,
                    timeslot.dayOfWeek,
                    timeslot.startTime,
                    timeslot.endTime,
                ],
            );

            return {
                dayOfWeek: parseInt(timeslotData[0].day_of_week),
                startTime: timeslotData[0].start_time,
                endTime: timeslotData[0].end_time,
            };
        });

        const allTimeslots: Timeslots[] = await Promise.all(timeslotPromises);

        await client.query('COMMIT;');

        const responseObj: object = {
            id: fareDetails[0].fare_detail_id,
            stationId: fareDetails[0].station_id,
            commuteSystemName: commuteSystemResults[0].name,
            name: fareDetails[0].fare_type,
            fare: parseFloat(fareDetails[0].fare),
            timeslots: allTimeslots,
            duration: fareDetails[0].duration,
            dayStart: fareDetails[0].day_start,
            alternateFareDetailsId: fareDetails[0].alternate_fare_details_id,
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
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated fare detail or an error message and updates the fare detail in the database
 */
export const updateFareDetail = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const {
        stationId,
        accountId,
        name,
        fare,
        timeslots,
        duration,
        dayStart,
        alternateFareDetailsId,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: fareDetails } = await client.query(
            `
                SELECT id
                    FROM fare_details
                    WHERE id = $1
            `,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        const { rows: commuteSystemResults } = await client.query(
            `
                SELECT *
                    FROM stations s
                    LEFT JOIN commute_systems csy ON s.commute_system_id = csy.id
                    WHERE s.id = $1
            `,
            [stationId],
        );

        if (commuteSystemResults.length === 0) {
            response
                .status(400)
                .send(
                    'You need to create a commute system before creating a fare detail',
                );

            return;
        }

        const { rows: currentTimeslots } = await client.query(
            `
                SELECT *
                    FROM timeslots
                    WHERE id = $1
            `,
            [id],
        );

        const { toInsert, toDelete, toUpdate } = compareTimeslots(
            currentTimeslots,
            timeslots,
        );

        await client.query('BEGIN;');

        toDelete.forEach(async (timeslot) => {
            await client.query(
                `
                    DELETE FROM timeslots
                        WHERE id = $1
                `,
                [timeslot.timeslot_id],
            );
        });

        toInsert.forEach(async (timeslot) => {
            await client.query(
                `
                    INSERT INTO timeslots
                    (fare_details_id, day_of_week, start_time, end_time)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `,
                [id, timeslot.dayOfWeek, timeslot.startTime, timeslot.endTime],
            );
        });

        const { rows: updateFareDetailResults } = await client.query(
            `
                UPDATE fare_details
                SET station_id = $1,
                account_id = $2,
                name = $3,
                fare = $4,
                duration = $5,
                day_start = $6,
                alternate_fare_details_id = $7
                WHERE id = $8
                RETURNING *
            `,
            [
                stationId,
                accountId,
                name,
                fare,
                duration,
                dayStart,
                alternateFareDetailsId,
                id,
            ],
        );

        await client.query('COMMIT;');

        const responseObj: object = {
            id: updateFareDetailResults[0].id,
            stationId: updateFareDetailResults[0].station_id,
            commuteSystemName: commuteSystemResults[0].name,
            name: updateFareDetailResults[0].fare_type,
            fare: parseFloat(updateFareDetailResults[0].fare),
            timeslots: timeslots,
            duration: updateFareDetailResults[0].duration,
            dayStart: updateFareDetailResults[0].day_start,
            alternateFareDetailsId:
                updateFareDetailResults[0].alternate_fare_details_id,
            dateCreated: updateFareDetailResults[0].date_created,
            dateModified: updateFareDetailResults[0].date_modified,
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
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: fareDetails } = await client.query(
            `
                SELECT id
                    FROM fare_details
                    WHERE id = $1
            `,
            [id],
        );

        if (fareDetails.length === 0) {
            response.status(404).send('Fare detail not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM fare_details
                    WHERE id = $1
            `,
            [id],
        );

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
