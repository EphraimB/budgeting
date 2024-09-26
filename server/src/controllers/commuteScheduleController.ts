import { type Request, type Response } from 'express';
import {
    handleError,
    isTimeWithinRange,
    toCamelCase,
} from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import dayjs from 'dayjs';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute schedules
 */
export const getCommuteSchedule = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT 
                    account_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                        'day_of_week', day_of_week,
                        'commute_schedules', commute_schedules
                        )::json
                    ) AS schedules
                    FROM (
                    SELECT 
                        cs.account_id,
                        cs.day_of_week,
                        JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', cs.id,
                            'pass', concat(csy.name, ' ', fd.name),
                            'start_time', cs.start_time,
                            'end_time', cs.end_time,
                            'fare', fd.fare
                        )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_detail_id = fd.id
                        LEFT JOIN commute_systems csy ON fd.commute_system_id = csy.id
                    WHERE 
                        cs.account_id = $1
                    GROUP BY 
                        cs.account_id, cs.day_of_week
                    ) AS subquery
                    GROUP BY 
                    account_id
            `;
            params = [accountId];
        } else {
            query = `
                SELECT 
                    account_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                        'day_of_week', day_of_week,
                        'commute_schedules', commute_schedules
                        )::json
                    ) AS schedules
                    FROM (
                    SELECT 
                        cs.account_id,
                        cs.day_of_week,
                        JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', cs.id,
                            'pass', concat(csy.name, ' ', fd.name),
                            'start_time', cs.start_time,
                            'end_time', cs.end_time,
                            'fare', fd.fare
                        )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_detail_id = fd.id
                        LEFT JOIN commute_systems csy ON fd.commute_system_id = csy.id
                    GROUP BY 
                        cs.account_id, cs.day_of_week
                    ) AS subquery
                    GROUP BY 
                    account_id
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting schedules');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a single schedule
 */
export const getCommuteScheduleById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, accountId } = request.query as {
        id?: string;
        accountId?: string;
    }; // Destructure id from query string

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT 
                    account_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                        'day_of_week', day_of_week,
                        'commute_schedules', commute_schedules
                        )::json
                    ) AS schedules
                    FROM (
                    SELECT 
                        cs.account_id,
                        cs.day_of_week,
                        JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', cs.id,
                            'pass', concat(csy.name, ' ', fd.name),
                            'start_time', cs.start_time,
                            'end_time', cs.end_time,
                            'fare', fd.fare
                        )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_detail_id = fd.id
                        LEFT JOIN commute_systems csy ON fd.commute_system_id = csy.id
                    WHERE 
                        cs.id = $1 AND cs.account_id = $2
                    GROUP BY 
                        cs.account_id, cs.day_of_week
                    ) AS subquery
                    GROUP BY 
                    account_id
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT 
                    account_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                        'day_of_week', day_of_week,
                        'commute_schedules', commute_schedules
                        )::json
                    ) AS schedules
                    FROM (
                    SELECT 
                        cs.account_id,
                        cs.day_of_week,
                        JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', cs.id,
                            'pass', concat(csy.name, ' ', fd.name),
                            'start_time', cs.start_time,
                            'end_time', cs.end_time,
                            'fare', fd.fare
                        )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_detail_id = fd.id
                        LEFT JOIN commute_systems csy ON fd.commute_system_id = csy.id
                    WHERE 
                        cs.id = $1
                    GROUP BY 
                        cs.account_id, cs.day_of_week
                    ) AS subquery
                    GROUP BY 
                    account_id
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting schedule of given id for ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created schedule or an error message and posts the schedule to the database
 */
export const createCommuteSchedule = async (
    request: Request,
    response: Response,
) => {
    const { accountId, dayOfWeek, fareDetailId, startTime, endTime } =
        request.body;
    let fareDetail = [];

    const client = await pool.connect(); // Get a client from the pool

    try {
        let currentFareDetailId = fareDetailId;
        let systemClosed = false;
        const alerts: object[] = [];

        // Check for overlapping day of week and start time
        const { rows: scheduleExistsResults } = await client.query(
            `
                SELECT 
                    cs.id
                    FROM commute_schedule cs
                    WHERE cs.account_id = $1
                AND cs.day_of_week = $2
                AND (
                -- New schedule starts within an existing schedule's time slot
                (cs.start_time <= $3 AND $3 < cs.end_time)
                OR
                -- Existing schedule starts within new schedule's time slot
                (cs.end_time < $4 AND cs.start_time >= $4)
                )
                GROUP BY cs.id
            `,
            [accountId, dayOfWeek, startTime, endTime],
        );

        if (scheduleExistsResults.length > 0) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        const { rows: fareAmountResults } = await client.query(
            `
                SELECT fare_details.id,
                    fare,
                    alternate_fare_detail_id
                FROM fare_details
                LEFT JOIN commute_systems
                ON fare_details.commute_system_id = commute_systems.id
                WHERE fare_details.id = $1
            `,
            [fareDetailId],
        );

        let oldFare = fareAmountResults[0].fare;

        while (true) {
            const { rows: fareDetailResults } = await client.query(
                `
                    SELECT fare_details.id,
                        fare,
                        alternate_fare_detail_id
                    FROM fare_details
                    LEFT JOIN commute_systems
                    ON fare_details.commute_system_id = commute_systems.id
                    WHERE fare_details.id = $1
                `,
                [currentFareDetailId],
            );

            fareDetail.push(fareDetailResults[0]);

            const { rows: fareTimeslots } = await client.query(
                `
                    SELECT *
                        FROM timeslots
                        WHERE fare_details_id = $1
                `,
                [currentFareDetailId],
            );

            let timeslotMatched = false;

            for (let timeslot of fareTimeslots) {
                if (
                    isTimeWithinRange(
                        startTime,
                        timeslot.start_time,
                        timeslot.end_time,
                    ) &&
                    dayOfWeek === timeslot.day_of_week
                ) {
                    timeslotMatched = true;
                    break; // exit the loop once a match is found
                }
            }

            if (timeslotMatched) {
                break; // exit the while loop since we found a matching timeslot
            } else if (fareDetail[0].alternate_fare_detail_id !== null) {
                const { rows: alternateFareDetail } = await client.query(
                    `
                        SELECT fare_details.id,
                            fare,
                            alternate_fare_detail_id
                        FROM fare_details
                        LEFT JOIN commute_systems
                        ON fare_details.commute_system_id = commute_systems.id
                        WHERE fare_details.id = $1
                    `,
                    [fareDetail[0].alternate_fare_detail_id],
                );

                const alternateFare = alternateFareDetail[0].fare;

                alerts.push({
                    message: `fare automatically stepped ${
                        oldFare - alternateFare > 0 ? 'down' : 'up'
                    } to ${alternateFare}`,
                });

                oldFare = alternateFare;
                currentFareDetailId = fareDetail[0].alternate_fare_detail_id; // use the alternate fare ID for the next loop iteration
            } else {
                systemClosed = true; // no alternate fare ID and no timeslot matched, so system is closed
                break;
            }

            break;
        }

        if (systemClosed) {
            response.status(400).send('System is closed for the given time');
            return;
        }

        await client.query('BEGIN;');

        const jobDetails = {
            frequencyType: /*commuteSchedule[0].duration !== null &&
                commuteSchedule[0].duration > 30
                    ? 2
                    : 1*/ 1,
            frequencyTypeVariable: 1,
            frequencyDayOfMonth: dayOfWeek || undefined,
            frequencyDayOfWeek: /*commuteSchedule[0].duration
                ? undefined
                :*/ dayOfWeek,
            date: dayjs()
                .hour(startTime.split(':')[0])
                .minute(startTime.split(':')[1])
                .second(startTime.split(':')[2])
                .toISOString(),
        };

        const cronDate = determineCronValues(jobDetails);

        const taxRate = 0;

        const uniqueId = uuidv4();

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO commute_history (account_id, commute_system, fare_type, fare, timestamp, is_timed_pass) VALUES (${accountId}, '${
                fareDetail[0].system_name
            }', '${fareDetail[0].fare_type}', ${-fareDetail[0]
                .fare}, 'now()', false)$$)`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${-fareDetail[0]
                .fare}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')$$)`);

        const { rows: cronIdResults } = await client.query(
            `
                INSERT INTO cron_jobs
                (unique_id, cron_expression)
                VALUES ($1, $2)
                RETURNING *
            `,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResults[0].id;

        const { rows: createCommuteSchedule } = await client.query(
            `
                INSERT INTO commute_schedule
                (account_id, cron_job_id, day_of_week, fare_detail_id, start_time, end_time)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
            [accountId, cronId, dayOfWeek, fareDetailId, startTime, endTime],
        );

        await client.query('COMMIT;');

        const { rows: commuteScheduleResults } = await client.query(
            `
                SELECT cs.id,
                    csy.id AS commute_system_id,
                    cs.account_id AS account_id,
                    cs.cron_job_id AS cron_job_id,
                    cs.fare_detail_id AS fare_detail_id,
                    cs.day_of_week AS day_of_week,
                    concat(csy.name, ' ', fd.name) AS pass,
                    cs.start_time AS start_time,
                    cs.end_time AS end_time,
                    fd.duration AS duration,
                    fd.day_start AS day_start,
                    fd.fare,
                    cs.date_created,
                    cs.date_modified
                FROM commute_schedule cs
                LEFT JOIN fare_details fd
                ON cs.fare_detail_id = fd.id
                LEFT JOIN commute_systems csy
                ON fd.commute_system_id = csy.id
                WHERE cs.id = $1
            `,
            [createCommuteSchedule[0].id],
        );

        const responseObj = {
            schedule: commuteScheduleResults,
            alerts,
        };

        response.status(201).json(responseObj);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating schedule');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated schedule or an error message and updates the schedule in the database
 */
export const updateCommuteSchedule = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId, dayOfWeek, fareDetailId, startTime, endTime } =
        request.body;
    let fareDetail = [];

    const client = await pool.connect(); // Get a client from the pool

    try {
        let currentFareDetailId = fareDetailId;
        let systemClosed = false;
        const alerts: object[] = [];

        const { rows } = await client.query(
            `
                SELECT id
                FROM commute_schedule
                WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        // Check for overlapping day_of_week and start_time
        const { rows: existingSchedule } = await client.query(
            `
                SELECT 
                    cs.id
                    FROM commute_schedule cs
                    WHERE cs.account_id = $1
                AND cs.day_of_week = $2
                AND (
                -- New schedule starts within an existing schedule's time slot
                (cs.start_time <= $3 AND $3 < cs.end_time)
                OR
                -- Existing schedule starts within new schedule's time slot
                (cs.end_time < $4 AND cs.start_time >= $4)
                )
                GROUP BY cs.id
            `,
            [accountId, dayOfWeek, startTime, endTime, id],
        );

        if (existingSchedule.length > 0) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        const { rows: oldFareResults } = await client.query(
            `
                SELECT fare_details.id,
                    fare,
                    alternate_fare_detail_id
                FROM fare_details
                LEFT JOIN commute_systems
                ON fare_details.commute_system_id = commute_systems.id
                WHERE fare_details.id = $1
            `,
            [fareDetailId],
        );

        let oldFare = oldFareResults[0].fare;

        while (true) {
            const { rows: fareDetailResults } = await client.query(
                `
                    SELECT fare_details.id,
                        fare,
                        alternate_fare_detail_id
                    FROM fare_details
                    LEFT JOIN commute_systems
                    ON fare_details.commute_system_id = commute_systems.id
                    WHERE fare_details.id = $1
                `,
                [currentFareDetailId],
            );

            fareDetail.push(fareDetailResults[0]);

            const { rows: fareTimeslots } = await client.query(
                `
                    SELECT *
                        FROM timeslots
                        WHERE fare_detail_id = $1
                `,
                [currentFareDetailId],
            );

            let timeslotMatched = false;

            for (let timeslot of fareTimeslots) {
                if (
                    isTimeWithinRange(
                        startTime,
                        timeslot.start_time,
                        timeslot.end_time,
                    ) &&
                    dayOfWeek === timeslot.day_of_week
                ) {
                    timeslotMatched = true;
                    break; // exit the loop once a match is found
                }
            }

            if (timeslotMatched) {
                break; // exit the while loop since we found a matching timeslot
            } else if (fareDetail[0].alternate_fare_detail_id) {
                const { rows: alternateFareDetail } = await client.query(
                    `
                        SELECT fare_details.id,
                            fare,
                            alternate_fare_detail_id
                        FROM fare_details
                        LEFT JOIN commute_systems
                        ON fare_details.commute_system_id = commute_systems.id
                        WHERE fare_details.id = $1
                    `,
                    [fareDetail[0].alternate_fare_detail_id],
                );
                const alternateFare = alternateFareDetail[0].fare;

                alerts.push({
                    message: `fare automatically stepped ${
                        oldFare - alternateFare > 0 ? 'down' : 'up'
                    } to ${alternateFare}`,
                });

                oldFare = alternateFare;
                currentFareDetailId = fareDetail[0].alternate_fare_detail_id; // use the alternate fare ID for the next loop iteration
            } else {
                systemClosed = true; // no alternate fare ID and no timeslot matched, so system is closed
                break;
            }
        }

        if (systemClosed) {
            response.status(400).send('System is closed for the given time');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);

        const jobDetails = {
            frequencyType: 1,
            frequencyTypeVariable: 1,
            frequency_day_of_week: dayOfWeek,
            date: dayjs()
                .hour(startTime.split(':')[0])
                .minute(startTime.split(':')[1])
                .second(startTime.split(':')[2])
                .toISOString(),
        };

        const cronDate = determineCronValues(jobDetails);

        const { rows: uniqueIdResults } = await client.query(
            `
                SELECT id, unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );

        const uniqueId = uniqueIdResults[0].unique_id;

        const taxRate = 0;

        await client.query('BEGIN;');

        await client.query(`SELECT cron.unschedule('${uniqueId}')`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO commute_history (account_id, commute_system, fare_type, fare, timestamp, is_timed_pass) VALUES (${accountId}, '${
                fareDetail[0].system_name
            }', '${fareDetail[0].fare_type}' '${-fareDetail[0]
                .fare}', 'now()', false)$$)`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${-fareDetail[0]
                .fare}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')$$)`);

        await client.query(
            `
                UPDATE cron_jobs
                SET unique_id = $1,
                cron_expression = $2
                WHERE id = $3
            `,
            [uniqueId, cronDate, cronId],
        );

        await client.query(
            `
                UPDATE commute_schedule
                SET account_id = $1,
                day_of_week = $2,
                fare_detail_id = $3,
                start_time = $4,
                end_time = $5
                WHERE id = $6
            `,
            [accountId, dayOfWeek, currentFareDetailId, startTime, endTime, id],
        );

        await client.query('COMMIT;');

        const { rows: commuteScheduleResults } = await client.query(
            `
                SELECT commute_schedule.id,
                    commute_systems.id AS commute_system_id,
                    commute_schedule.account_id AS account_id,
                    commute_schedule.cron_job_id AS cron_job_id,
                    commute_schedule.fare_detail_id AS fare_detail_id,
                    commute_schedule.day_of_week AS day_of_week,
                    concat(commute_systems.name, ' ', fare_details.name) AS pass,
                    commute_schedule.start_time AS start_time,
                    commute_schedule.end_time AS end_time,
                    fare_details.duration AS duration,
                    fare_details.day_start AS day_start,
                    fare_details.fare,
                    commute_schedule.date_created,
                    commute_schedule.date_modified
                FROM commute_schedule
                LEFT JOIN fare_details
                ON commute_schedule.fare_detail_id = fare_details.id
                LEFT JOIN commute_systems
                ON fare_details.commute_system_id = commute_systems.id
                WHERE commute_schedule.id = $1
            `,
            [id],
        );

        const responseObj = {
            schedule: commuteScheduleResults,
            alerts,
        };

        response.status(200).json(responseObj);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating schedule');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the schedule from the database
 */
export const deleteCommuteSchedule = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id,
                FROM commute_schedule
                WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const cronId: number = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM commute_schedule
                WHERE id = $1
            `,
            [id],
        );

        const { rows: results } = await client.query(
            `
                SELECT id, unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );

        await client.query(`SELECT cron.unschedule('${results[0].unique_id}')`);

        await client.query(
            `
                DELETE FROM cron_jobs
                WHERE id = $1
            `,
            [cronId],
        );

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted schedule');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting schedule');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
