import { NextFunction, type Request, type Response } from 'express';
import {
    commuteScheduleQueries,
    cronJobQueries,
    fareDetailsQueries,
    fareTimeslotsQueries,
} from '../models/queryData.js';
import { handleError, parseIntOrFallback } from '../utils/helperFunctions.js';
import { type CommuteSchedule, FareDetails } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import dayjs from 'dayjs';
import pool from '../config/db.js';

interface Schedule {
    day_of_week: number;
    passes: Array<{
        commute_schedule_id: number;
        pass: string;
        start_time: string;
        duration: number | null;
        fare_amount: number;
    }>;
}

/**
 *
 * @param commuteSchedule - Commute schedule object to parse
 * @returns - Parsed commute system object
 */
const parseCommuteSchedule = (
    commuteSchedule: Record<string, string>,
): CommuteSchedule => ({
    id: parseInt(commuteSchedule.commute_schedule_id),
    commute_system_id: parseInt(commuteSchedule.commute_system_id),
    account_id: parseInt(commuteSchedule.account_id),
    day_of_week: parseInt(commuteSchedule.day_of_week),
    fare_detail_id: parseInt(commuteSchedule.fare_detail_id),
    start_time: commuteSchedule.start_time,
    end_time: commuteSchedule.end_time,
    duration: parseIntOrFallback(commuteSchedule.duration),
    fare_amount: parseFloat(commuteSchedule.fare_amount),
    pass: commuteSchedule.pass,
    date_created: commuteSchedule.date_created,
    date_modified: commuteSchedule.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute schedule or a single schedule
 */
export const getCommuteSchedule = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, account_id } = request.query as {
        id?: string;
        account_id?: string;
    }; // Destructure id from query string

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        // Change the query based on the presence of id
        if (id && account_id) {
            query = commuteScheduleQueries.getCommuteSchedulesByIdAndAccountId;
            params = [account_id, id];
        } else if (id) {
            query = commuteScheduleQueries.getCommuteSchedulesById;
            params = [id];
        } else if (account_id) {
            query = commuteScheduleQueries.getCommuteSchedulesByAccountId;
            params = [account_id];
        } else {
            query = commuteScheduleQueries.getCommuteSchedules;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const parsedCommuteSchedule = rows.map((s) => parseCommuteSchedule(s));

        const groupedByDay = parsedCommuteSchedule.reduce(
            (acc: Record<number, Schedule>, curr) => {
                const dayOfWeek = curr.day_of_week;
                if (!acc[dayOfWeek]) {
                    acc[dayOfWeek] = {
                        day_of_week: dayOfWeek,
                        passes: [],
                    };
                }
                acc[dayOfWeek].passes.push({
                    commute_schedule_id: curr.id,
                    pass: curr.pass,
                    start_time: curr.start_time,
                    duration: curr.duration,
                    fare_amount: curr.fare_amount,
                });
                return acc;
            },
            {},
        );

        const responseObj = {
            schedule: Object.values(groupedByDay),
        };

        response.status(200).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'schedule for given id'
                    : account_id
                    ? 'schedule for given account id'
                    : 'schedules'
            }`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param startTime - Start time of the schedule
 * @param rangeStart - Start time of the range
 * @param rangeEnd  - End time of the range
 * @returns - True if the start time is within the range, false otherwise
 */
const isTimeWithinRange = (
    startTime: string,
    rangeStart: string,
    rangeEnd: string,
): boolean => {
    const baseDate = '1970-01-01 '; // Using a base date since we're only comparing times
    const startDateTime = dayjs(baseDate + startTime);
    const rangeStartDateTime = dayjs(baseDate + rangeStart);
    const rangeEndDateTime = dayjs(baseDate + rangeEnd);

    return (
        startDateTime >= rangeStartDateTime && startDateTime < rangeEndDateTime
    );
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
    next: NextFunction,
) => {
    const { account_id, day_of_week, fare_detail_id, start_time, end_time } =
        request.body;
    let fareDetail: FareDetails[] = [];

    const client = await pool.connect(); // Get a client from the pool

    try {
        let currentFareDetailId = fare_detail_id;
        let systemClosed = false;
        const alerts: object[] = [];

        // Check for overlapping day_of_week and start_time
        const { rows } = await client.query(
            commuteScheduleQueries.getCommuteScheduleByDayAndTime,
            [account_id, day_of_week, start_time, end_time],
        );

        if (rows.length > 0) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        const { rows: fareAmountResults } = await client.query(
            fareDetailsQueries.getFareDetailsById,
            [fare_detail_id],
        );

        let oldFare = fareAmountResults[0].fare_amount;

        while (true) {
            const { rows: fareDetailResults } = await client.query(
                fareDetailsQueries.getFareDetailsById,
                [currentFareDetailId],
            );

            fareDetail.push(fareDetailResults[0]);

            const { rows: fareTimeslots } = await client.query(
                fareTimeslotsQueries.getTimeslotsByFareId,
                [currentFareDetailId],
            );

            let timeslotMatched = false;

            for (let timeslot of fareTimeslots) {
                if (
                    isTimeWithinRange(
                        start_time,
                        timeslot.start_time,
                        timeslot.end_time,
                    ) &&
                    day_of_week === timeslot.day_of_week
                ) {
                    timeslotMatched = true;
                    break; // exit the loop once a match is found
                }
            }

            if (timeslotMatched) {
                break; // exit the while loop since we found a matching timeslot
            } else if (fareDetail[0].alternate_fare_detail_id) {
                const { rows: alternateFareDetail } = await client.query(
                    fareDetailsQueries.getFareDetailsById,
                    [fareDetail[0].alternate_fare_detail_id],
                );

                const alternateFare = alternateFareDetail[0].fare_amount;

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

        const { rows: createCommuteSchedule } = await client.query(
            commuteScheduleQueries.createCommuteSchedule,
            [
                account_id,
                day_of_week,
                currentFareDetailId,
                start_time,
                end_time,
            ],
        );

        const { rows: commuteSchedule } = await client.query(
            commuteScheduleQueries.getCommuteSchedulesById,
            [createCommuteSchedule[0].commute_schedule_id],
        );

        const jobDetails = {
            frequency_type:
                commuteSchedule[0].duration !== null &&
                commuteSchedule[0].duration > 30
                    ? 2
                    : 1,
            frequency_type_variable: 1,
            frequency_day_of_month: commuteSchedule[0].day_of_week || undefined,
            frequency_day_of_week: commuteSchedule[0].duration
                ? undefined
                : day_of_week,
            date: dayjs()
                .hour(start_time.split(':')[0])
                .minute(start_time.split(':')[1])
                .second(start_time.split(':')[2])
                .toISOString(),
        };

        const cronDate = determineCronValues(jobDetails);

        const taxRate = 0;

        const uniqueId = `commute-${commuteSchedule[0].id}`;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO commute_history (account_id, fare_amount, commute_system, fare_type, timestamp) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, '${fareDetail[0].system_name}', '${
                fareDetail[0].fare_type
            }', now())$$)`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')$$)`);

        const { rows: cronIdResults } = await client.query(
            cronJobQueries.createCronJob,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResults[0].cron_job_id;

        await client.query(commuteScheduleQueries.updateCommuteWithCronJobId, [
            cronId,
            commuteSchedule[0].id,
        ]);

        await client.query('COMMIT;');

        request.commute_schedule_id = commuteSchedule[0].id;
        request.alerts = alerts;

        next();
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
 * Sends a response with the created commute schedule
 */
export const createCommuteScheduleReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { commute_schedule_id } = request;
    const { alerts } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteScheduleQueries.getCommuteSchedulesById,
            [commute_schedule_id],
        );

        const modifiedCommuteSchedule = rows.map((row) =>
            parseCommuteSchedule(row),
        );

        const responseObj = {
            schedule: modifiedCommuteSchedule,
            alerts,
        };

        response.status(201).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting commute schedule');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the updated schedule or an error message and updates the schedule in the database
 */
export const updateCommuteSchedule = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const { account_id, day_of_week, fare_detail_id, start_time, end_time } =
        request.body;
    let fareDetail: FareDetails[] = [];

    const client = await pool.connect(); // Get a client from the pool

    try {
        let currentFareDetailId = fare_detail_id;
        let systemClosed = false;
        const alerts: object[] = [];

        const { rows } = await client.query(
            commuteScheduleQueries.getCommuteSchedulesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        // Check for overlapping day_of_week and start_time
        const { rows: existingSchedule } = await client.query(
            commuteScheduleQueries.getCommuteScheduleByDayAndTimeExcludingId,
            [account_id, day_of_week, start_time, end_time, id],
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
            fareDetailsQueries.getFareDetailsById,
            [fare_detail_id],
        );

        let oldFare = oldFareResults[0].fare_amount;

        while (true) {
            const { rows: fareDetailResults } = await client.query(
                fareDetailsQueries.getFareDetailsById,
                [currentFareDetailId],
            );

            fareDetail.push(fareDetailResults[0]);

            const { rows: fareTimeslots } = await client.query(
                fareTimeslotsQueries.getTimeslotsByFareId,
                [currentFareDetailId],
            );

            let timeslotMatched = false;

            for (let timeslot of fareTimeslots) {
                if (
                    isTimeWithinRange(
                        start_time,
                        timeslot.start_time,
                        timeslot.end_time,
                    ) &&
                    day_of_week === timeslot.day_of_week
                ) {
                    timeslotMatched = true;
                    break; // exit the loop once a match is found
                }
            }

            if (timeslotMatched) {
                break; // exit the while loop since we found a matching timeslot
            } else if (fareDetail[0].alternate_fare_detail_id) {
                const { rows: alternateFareDetail } = await client.query(
                    fareDetailsQueries.getFareDetailsById,
                    [fareDetail[0].alternate_fare_detail_id],
                );
                const alternateFare = alternateFareDetail[0].fare_amount;

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
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: day_of_week,
            date: dayjs()
                .hour(start_time.split(':')[0])
                .minute(start_time.split(':')[1])
                .second(start_time.split(':')[2])
                .toISOString(),
        };

        const cronDate = determineCronValues(jobDetails);

        const { rows: uniqueIdResults } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        const uniqueId = uniqueIdResults[0].unique_id;

        const taxRate = 0;

        await client.query('BEGIN;');

        await client.query(`cron.unschedule(${uniqueId})`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO commute_history (account_id, fare_amount, commute_system, fare_type, timestamp) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, '${fareDetail[0].system_name}', '${
                fareDetail[0].fare_type
            }', now())$$)`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')$$)`);

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await client.query(commuteScheduleQueries.updateCommuteSchedule, [
            account_id,
            day_of_week,
            currentFareDetailId,
            start_time,
            end_time,
            id,
        ]);

        await client.query('COMMIT;');

        request.commute_schedule_id = id;
        request.alerts = alerts;

        next();
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
 * Sends a response with the updated schedule
 */
export const updateCommuteScheduleReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { commute_schedule_id } = request;
    const { alerts } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteScheduleQueries.getCommuteSchedulesById,
            [commute_schedule_id],
        );

        const modifiedCommuteSchedule = rows.map((row) =>
            parseCommuteSchedule(row),
        );

        const responseObj = {
            schedule: modifiedCommuteSchedule,
            alerts,
        };

        response.status(200).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting schedule');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with a success message or an error message and deletes the schedule from the database
 */
export const deleteCommuteSchedule = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id = parseInt(request.params.id);

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            commuteScheduleQueries.getCommuteSchedulesById,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const cronId: number = rows[0].cron_job_id;

        await client.query('BEGIN;');

        await client.query(commuteScheduleQueries.deleteCommuteSchedule, [id]);

        const { rows: results } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        await client.query(`cron.unschedule(${results[0].unique_id})`);

        await client.query(cronJobQueries.deleteCronJob, [cronId]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting schedule');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the deleted schedule
 */
export const deleteCommuteScheduleReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Successfully deleted schedule');
};
