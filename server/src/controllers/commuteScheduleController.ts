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
    _: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
            SELECT
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                    'dayOfWeek', day_of_week,
                    'commuteSchedules', commute_schedules
                    )::json
                ) AS schedules
                FROM (
                SELECT
                    cs.day_of_week,
                    JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', cs.id,
                        'pass', concat(csy.name, ' ', fd.name),
                        'startTime', cs.start_time,
                        'endTime', cs.start_time + interval '1 minute' * s.trip_duration,
                        'fare', fd.fare
                    )::json
                    ) AS commute_schedules
                FROM 
                    commute_schedule cs
                    LEFT JOIN fare_details fd ON cs.fare_details_id = fd.id
                    LEFT JOIN stations s ON fd.station_id = s.id
                    LEFT JOIN commute_systems csy ON s.commute_system_id = csy.id
                GROUP BY 
                    fd.account_id, cs.day_of_week
                ) AS subquery
            `,
            [],
        );

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
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                        'dayOfWeek', day_of_week,
                        'commuteSchedules', commute_schedules
                        )::json
                    ) AS schedules
                    FROM (
                    SELECT
                        cs.day_of_week,
                        JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', cs.id,
                            'pass', concat(csy.name, ' ', fd.name),
                            'startTime', cs.start_time,
                            'endTime', cs.start_time + interval '1 minute' * s.trip_duration,
                            'fare', fd.fare
                        )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_details_id = fd.id
                        LEFT JOIN stations s ON fd.station_id = s.id
                        LEFT JOIN commute_systems csy ON s.commute_system_id = csy.id
                        WHERE cs.id = $1
                    GROUP BY 
                        fd.account_id, cs.day_of_week
                    ) AS subquery
            `,
            [id],
        );

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
    const { dayOfWeek, fareDetailId, startTime } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const alerts: object[] = [];

        const { rows: commuteSystemResults } = await client.query(
            `
                SELECT id, duration, day_start
                    FROM fare_details
                    WHERE id = $1
            `,
            [fareDetailId],
        );

        if (commuteSystemResults.length === 0) {
            response
                .status(400)
                .send(
                    'You need to create a fare detail before creating a commute schedule',
                );

            return;
        }

        // --- Trying to combine code into 1 query
        const { rows: fareInfo } = await client.query(
            `
                WITH 
                    -- Check overlapping schedules
                    overlapping_schedules AS (
                        SELECT cs.id AS overlapping_schedule_id
                        FROM commute_schedule cs 
                        LEFT JOIN fare_details fd ON cs.fare_details_id = fd.id 
                        LEFT JOIN stations s ON fd.station_id = s.id 
                        WHERE cs.day_of_week = $1
                        AND cs.start_time <= $3
                        AND $3 < cs.start_time + interval '1 minute' * COALESCE(s.trip_duration, 0)
                    ),
                    
                    -- Get main fare details
                    main_fare_details AS (
                        SELECT fd.id AS fare_detail_id, 
                            cs.name AS system_name, 
                            fd.name AS fare_type, 
                            fd.fare AS main_fare, 
                            fd.alternate_fare_details_id
                        FROM fare_details fd 
                        LEFT JOIN stations s ON fd.station_id = s.id 
                        LEFT JOIN commute_systems cs ON s.commute_system_id = cs.id 
                        WHERE fd.id = $2
                    ),
                    
                    -- Get timeslots for main fare details
                    main_fare_timeslots AS (
                        SELECT 1 AS timeslot_exists
                        FROM timeslots t 
                        WHERE t.fare_details_id = $2 
                        AND t.day_of_week = $1
                        AND $3 >= t.start_time 
                        AND $3 < t.end_time
                    ),
                    
                    -- Get alternate fare details if main fare timeslot not valid
                    alternate_fare_details AS (
                        SELECT fd.id AS alternate_fare_id, fd.fare AS alternate_fare
                        FROM fare_details fd 
                        WHERE fd.id = (SELECT alternate_fare_details_id FROM fare_details WHERE id = 2)
                    ),
                    
                    -- Get timeslots for alternate fare details
                    alternate_fare_timeslots AS (
                        SELECT 1 AS alternate_timeslot_exists
                        FROM timeslots t 
                        WHERE t.fare_details_id = (SELECT alternate_fare_id FROM alternate_fare_details) 
                        AND t.day_of_week = $1
                        AND $3 >= t.start_time 
                        AND $3 < t.end_time
                    ),
                    
                    -- Step fare up/down and determine system open status
                    stepped_fare AS (
                        SELECT 
                        mf.main_fare AS original_fare,
                        CASE 
                            WHEN EXISTS (SELECT 1 FROM main_fare_timeslots) THEN mf.main_fare
                            WHEN EXISTS (SELECT 1 FROM alternate_fare_timeslots) THEN afd.alternate_fare 
                            ELSE NULL -- NULL implies the system is closed
                        END AS fare,
                        CASE 
                            WHEN EXISTS (SELECT 1 FROM main_fare_timeslots) OR EXISTS (SELECT 1 FROM alternate_fare_timeslots) 
                            THEN true 
                            ELSE false 
                        END AS system_opened
                        FROM main_fare_details mf
                        LEFT JOIN alternate_fare_details afd ON mf.alternate_fare_details_id = afd.alternate_fare_id
                    )

                    SELECT 
                    os.overlapping_schedule_id,
                    CASE WHEN sf.system_opened THEN mf.system_name ELSE NULL END AS system_name,
                    CASE WHEN sf.system_opened THEN mf.fare_type ELSE NULL END AS fare_type,
                    CASE WHEN sf.system_opened THEN sf.original_fare ELSE NULL END AS original_fare,
                    CASE WHEN sf.system_opened THEN sf.fare ELSE NULL END AS fare,
                    sf.system_opened
                    FROM main_fare_details mf
                    LEFT JOIN overlapping_schedules os ON TRUE
                    CROSS JOIN stepped_fare sf
            `,
            [dayOfWeek, fareDetailId, startTime],
        );

        if (fareInfo[0].system_opened === false) {
            response.status(400).send('System is closed for the given time');
            return;
        }

        if (fareInfo[0].overlapping_schedule_id !== null) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        await client.query('BEGIN;');

        const { rows: createCommuteSchedule } = await client.query(
            `
                INSERT INTO commute_schedule
                (day_of_week, fare_details_id, start_time)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
            [dayOfWeek, fareDetailId, startTime],
        );

        const { rows: commuteScheduleResults } = await client.query(
            `
                SELECT 
                    subquery.account_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'dayOfWeek', subquery.day_of_week,
                            'commuteSchedules', subquery.commute_schedules
                        )::json
                    ) AS schedules
                FROM (
                    SELECT 
                        fd.account_id,
                        cs.day_of_week,
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', cs.id,
                                'pass', concat(csy.name, ' ', fd.name),
                                'startTime', cs.start_time,
                                'fare', fd.fare
                            )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_details_id = fd.id
                  			LEFT JOIN stations s ON fd.station_id = s.id
                        LEFT JOIN commute_systems csy ON s.commute_system_id = csy.id
                    WHERE 
                        cs.id = $1
                    GROUP BY 
                        fd.account_id, cs.day_of_week
                ) AS subquery
                GROUP BY 
                    subquery.account_id;
            `,
            [createCommuteSchedule[0].id],
        );

        if (commuteSystemResults[0].duration === null) {
            const jobDetails = {
                frequencyType: 1,
                frequencyTypeVariable: 1,
                frequencyDayOfWeek: dayOfWeek,
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
            $$INSERT INTO commute_history (account_id, commute_system, fare_type, fare, timestamp, is_timed_pass) VALUES (${commuteScheduleResults[0].account_id}, '${
                fareInfo[0].system_name
            }', '${fareInfo[0].fare_type}', ${-fareInfo[0]
                .fare}, 'now()', false)$$)`);

            await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${commuteScheduleResults[0].account_id}, ${-fareInfo[0]
                .fare}, ${taxRate}, '${
                fareInfo[0].system_name + ' ' + fareInfo[0].fare_type
            }', '${
                fareInfo[0].system_name + ' ' + fareInfo[0].fare_type + ' pass'
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

            await client.query(
                `
                UPDATE commute_schedule
                SET cron_job_id = $1
                WHERE id = $2
            `,
                [cronId, createCommuteSchedule[0].id],
            );
        } else {
            // Timed pass (duration is set)
            const jobDetails = {
                frequencyType: 0, // Daily frequency
                frequencyTypeVariable: commuteSystemResults[0].duration, // Duration in days
                date: dayjs()
                    .month(
                        commuteSystemResults[0].day_start
                            ? dayjs().date() > commuteSystemResults[0].day_start
                                ? dayjs().month() + 1
                                : dayjs().month()
                            : dayjs().month(),
                    )
                    .date(commuteSystemResults[0].day_start || dayjs().date())
                    .hour(startTime.split(':')[0])
                    .minute(startTime.split(':')[1])
                    .second(startTime.split(':')[2])
                    .toISOString(),
            };

            const cronDate = determineCronValues(jobDetails);

            const taxRate = 0;

            const uniqueId = uuidv4();

            const { rows: existingMonthlyPass } = await client.query(
                `
                SELECT id FROM commute_schedule cs
                WHERE EXISTS (
                    SELECT id FROM fare_details fd
                    WHERE fd.id = cs.fare_details_id
                    AND fd.duration = $1
                    AND fd.account_id = $2
                )
              `,
                [
                    commuteSystemResults[0].duration,
                    commuteScheduleResults[0].account_id,
                ],
            );

            if (existingMonthlyPass.length <= 1) {
                await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO commute_history (account_id, commute_system, fare_type, fare, timestamp, is_timed_pass) VALUES (${commuteScheduleResults[0].account_id}, '${
                fareInfo[0].system_name
            }', '${fareInfo[0].fare_type}', ${-fareInfo[0]
                .fare}, 'now()', false)$$)`);

                await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${commuteScheduleResults[0].account_id}, ${-fareInfo[0]
                .fare}, ${taxRate}, '${
                fareInfo[0].system_name + ' ' + fareInfo[0].fare_type
            }', '${
                fareInfo[0].system_name + ' ' + fareInfo[0].fare_type + ' pass'
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

                await client.query(
                    `
                UPDATE commute_schedule
                SET cron_job_id = $1
                WHERE id = $2
            `,
                    [cronId, createCommuteSchedule[0].id],
                );
            } else {
                const { rows: getCronIdResult } = await client.query(
                    `
                    SELECT DISTINCT cs.cron_job_id
                        FROM commute_schedule cs
                        WHERE cs.fare_details_id IN (
                        SELECT id
                        FROM fare_details
                        WHERE duration = $1 AND account_id = $2
                        )
                        AND cs.cron_job_id IS NOT NULL;
                    `,
                    [
                        commuteSystemResults[0].duration,
                        commuteScheduleResults[0].account_id,
                    ],
                );

                const cronId = getCronIdResult[0].cron_job_id;

                await client.query(
                    `
                UPDATE commute_schedule
                SET cron_job_id = $1
                WHERE id = $2
            `,
                    [cronId, createCommuteSchedule[0].id],
                );
            }
        }

        await client.query('COMMIT;');

        const responseObj = {
            schedule: toCamelCase(commuteScheduleResults[0]),
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
    const { dayOfWeek, fareDetailId, startTime } = request.body;
    let fareDetail = [];

    const client = await pool.connect(); // Get a client from the pool

    try {
        let currentFareDetailId = fareDetailId;
        let systemClosed = false;
        const alerts: object[] = [];

        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                FROM commute_schedule
                WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const { rows: commuteSystemResults } = await client.query(
            `
                SELECT id
                    FROM fare_details
                    WHERE id = $1
            `,
            [fareDetailId],
        );

        if (commuteSystemResults.length === 0) {
            response
                .status(400)
                .send(
                    'You need to create a fare detail before creating a commute schedule',
                );

            return;
        }

        // Check for overlapping day_of_week and start_time
        const { rows: existingSchedule } = await client.query(
            `
                SELECT 
                    cs.id
                    FROM commute_schedule cs
                WHERE cs.day_of_week = $1
                AND (
                -- New schedule starts within an existing schedule's time slot
                (cs.start_time <= $2 AND $2 < cs.end_time)
                OR
                -- Existing schedule starts within new schedule's time slot
                (cs.end_time < $3 AND cs.start_time >= $3)
                )
                GROUP BY cs.id
            `,
            [dayOfWeek, startTime],
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
                    commute_systems.name AS system_name,
                    fare_details.name AS fare_type,
                    fare,
                    alternate_fare_details_id
                FROM fare_details
                LEFT JOIN stations
                ON fare_details.station_id = stations.id
                LEFT JOIN commute_systems
                ON stations.commute_system_id = commute_systems.id
                WHERE fare_details.id = $1
            `,
            [fareDetailId],
        );

        let oldFare = oldFareResults[0].fare;

        while (true) {
            const { rows: fareDetailResults } = await client.query(
                `
                    SELECT fare_details.id,
                        commute_systems.name AS system_name,
                        fare_details.name AS fare_type,
                        fare,
                        alternate_fare_details_id
                    FROM fare_details
                    LEFT JOIN stations
                    ON fare_details.station_id = stations.id
                    LEFT JOIN commute_systems
                    ON stations.commute_system_id = commute_systems.id
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
            } else if (fareDetail[0].alternate_fare_detail_id) {
                const { rows: alternateFareDetail } = await client.query(
                    `
                        SELECT fare_details.id,
                            fare,
                            alternate_fare_details_id
                        FROM fare_details
                        LEFT JOIN stations
                        ON fare_details.station_id = stations.id
                        LEFT JOIN commute_systems
                        ON stations.commute_system_id = commute_systems.id
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

        await client.query('BEGIN;');

        await client.query(
            `
                    UPDATE commute_schedule
                    SET day_of_week = $1,
                    fare_details_id = $2,
                    start_time = $3
                    WHERE id = $4
                `,
            [dayOfWeek, currentFareDetailId, startTime, id],
        );

        const { rows: commuteScheduleResults } = await client.query(
            `
                SELECT 
                    subquery.account_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'dayOfWeek', subquery.day_of_week,
                            'commuteSchedules', subquery.commute_schedules
                        )::json
                    ) AS schedules
                FROM (
                    SELECT 
                        fd.account_id,
                        cs.day_of_week,
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', cs.id,
                                'pass', concat(csy.name, ' ', fd.name),
                                'startTime', cs.start_time,
                                'endTime', cs.end_time,
                                'fare', fd.fare
                            )::json
                        ) AS commute_schedules
                    FROM 
                        commute_schedule cs
                        LEFT JOIN fare_details fd ON cs.fare_details_id = fd.id
                  			LEFT JOIN stations s ON fd.station_id = s.id
                        LEFT JOIN commute_systems csy ON s.commute_system_id = csy.id
                    WHERE 
                        cs.id = $1
                    GROUP BY 
                        fd.account_id, cs.day_of_week
                ) AS subquery
                GROUP BY 
                    subquery.account_id;
            `,
            [id],
        );

        const { rows: timedPassResults } = await client.query(
            `
                SELECT id, duration
                FROM fare_details
                WHERE id = $1
            `,
            [id],
        );

        if (timedPassResults[0].duration === null) {
            const cronId: number = parseInt(rows[0].cron_job_id);

            const jobDetails = {
                frequencyType: 1,
                frequencyTypeVariable: 1,
                frequencyDayOfWeek: dayOfWeek,
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

            await client.query(
                `
                UPDATE cron_jobs
                SET unique_id = $1,
                cron_expression = $2
                WHERE id = $3
            `,
                [uniqueId, cronDate, cronId],
            );

            await client.query(`SELECT cron.unschedule('${uniqueId}')`);

            await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO commute_history (account_id, commute_system, fare_type, fare, timestamp, is_timed_pass) VALUES (${commuteScheduleResults[0].account_id}, '${
                fareDetail[0].system_name
            }', '${fareDetail[0].fare_type}' '${-fareDetail[0]
                .fare}', 'now()', false)$$)`);

            await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${commuteScheduleResults[0].account_id}, ${-fareDetail[0]
                .fare}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')$$)`);
        }

        await client.query('COMMIT;');

        const responseObj = {
            schedule: toCamelCase(commuteScheduleResults[0]),
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
                SELECT id, cron_job_id
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
