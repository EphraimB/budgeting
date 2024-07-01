import { NextFunction, type Request, type Response } from 'express';
import {
    commuteScheduleQueries,
    cronJobQueries,
    fareDetailsQueries,
    fareTimeslotsQueries,
} from '../models/queryData.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
    scheduleQuery,
    unscheduleQuery,
} from '../utils/helperFunctions.js';
import {
    Timeslots,
    type CommuteSchedule,
    FareDetails,
} from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import dayjs from 'dayjs';

interface Schedule {
    day_of_week: number;
    passes: Array<{
        commute_schedule_id: number;
        pass: string;
        start_time: string;
        duration: number | null;
        day_start: number | null;
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
    day_start: parseIntOrFallback(commuteSchedule.day_start),
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

        const commuteSchedule = await executeQuery(query, params);

        if (id && commuteSchedule.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const parsedCommuteSchedule = commuteSchedule.map((s) =>
            parseCommuteSchedule(s),
        );

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
                    day_start: curr.day_start,
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
                    ? 'schedule for given account_id'
                    : 'schedules'
            }`,
        );
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

    try {
        let currentFareDetailId = fare_detail_id;
        let systemClosed = false;
        const alerts: object[] = [];

        // Check for overlapping day_of_week and start_time
        const existingSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteScheduleByDayAndTime,
            [account_id, day_of_week, start_time, end_time],
        );

        if (existingSchedule.length > 0) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        let oldFare = (
            await executeQuery(fareDetailsQueries.getFareDetailsById, [
                fare_detail_id,
            ])
        )[0].fare_amount;

        while (true) {
            fareDetail = await executeQuery(
                fareDetailsQueries.getFareDetailsById,
                [currentFareDetailId],
            );

            const fareTimeslots: Timeslots[] = await executeQuery(
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
                const alternateFareDetail = await executeQuery(
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

        const rows = await executeQuery(
            commuteScheduleQueries.createCommuteSchedule,
            [
                account_id,
                day_of_week,
                currentFareDetailId,
                start_time,
                end_time,
            ],
        );

        const commuteSchedule = rows.map((s) => parseCommuteSchedule(s));

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

        const taxRate = 0;

        const unique_id = `commute-${commuteSchedule[0].id}`;

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO commute_history (account_id, fare_amount, commute_system, fare_type, timestamp) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, '${fareDetail[0].system_name}', '${
                fareDetail[0].fare_type
            }', now())`,
        );

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')`,
        );

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                unique_id,
                cronDate,
            ])
        )[0].cron_job_id;

        await executeQuery(commuteScheduleQueries.updateCommuteWithCronJobId, [
            cronId,
            commuteSchedule[0].id,
        ]);

        request.commute_schedule_id = commuteSchedule[0].id;
        request.alerts = alerts;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating schedule');
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

    try {
        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [commute_schedule_id],
        );

        const modifiedCommuteSchedule =
            commuteSchedule.map(parseCommuteSchedule);

        const responseObj = {
            schedule: modifiedCommuteSchedule,
            alerts,
        };

        response.status(201).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting commute schedule');
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

    try {
        let currentFareDetailId = fare_detail_id;
        let systemClosed = false;
        const alerts: object[] = [];

        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [id],
        );

        if (commuteSchedule.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        // Check for overlapping day_of_week and start_time
        const existingSchedule = await executeQuery(
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

        let oldFare = (
            await executeQuery(fareDetailsQueries.getFareDetailsById, [
                fare_detail_id,
            ])
        )[0].fare_amount;

        while (true) {
            fareDetail = await executeQuery(
                fareDetailsQueries.getFareDetailsById,
                [currentFareDetailId],
            );

            const fareTimeslots: Timeslots[] = await executeQuery(
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
                const alternateFareDetail = await executeQuery(
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

        const cronId: number = parseInt(commuteSchedule[0].cron_job_id);

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

        const [{ unique_id }] = await executeQuery(cronJobQueries.getCronJob, [
            cronId,
        ]);

        const taxRate = 0;

        await unscheduleQuery(unique_id);

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO commute_history (account_id, fare_amount, commute_system, fare_type, timestamp) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, '${fareDetail[0].system_name}', '${
                fareDetail[0].fare_type
            }', now())`,
        );

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${-fareDetail[0]
                .fare_amount}, ${taxRate}, '${
                fareDetail[0].system_name + ' ' + fareDetail[0].fare_type
            }', '${
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass'
            }')`,
        );

        await executeQuery(cronJobQueries.updateCronJob, [
            unique_id,
            cronDate,
            cronId,
        ]);

        await executeQuery(commuteScheduleQueries.updateCommuteSchedule, [
            account_id,
            day_of_week,
            currentFareDetailId,
            start_time,
            end_time,
            id,
        ]);

        request.commute_schedule_id = id;
        request.alerts = alerts;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating schedule');
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

    try {
        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [commute_schedule_id],
        );

        const modifiedCommuteSchedule =
            commuteSchedule.map(parseCommuteSchedule);

        const responseObj = {
            schedule: modifiedCommuteSchedule,
            alerts,
        };

        response.status(200).json(responseObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting schedule');
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
    try {
        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [id],
        );

        if (commuteSchedule.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const cronId: number = commuteSchedule[0].cron_job_id;

        await executeQuery(commuteScheduleQueries.deleteCommuteSchedule, [id]);

        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        await unscheduleQuery(results[0].unique_id);

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting schedule');
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
