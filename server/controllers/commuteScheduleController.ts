import { NextFunction, type Request, type Response } from 'express';
import {
    commuteScheduleQueries,
    commuteSystemQueries,
    cronJobQueries,
    fareDetailsQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteSchedule } from '../types/types.js';
import { logger } from '../config/winston.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';

interface Schedule {
    day_of_week: number;
    passes: Array<{
        commute_schedule_id: number;
        pass: string;
        start_time: string;
        duration: number;
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
    commute_schedule_id: parseInt(commuteSchedule.commute_schedule_id),
    commute_system_id: parseInt(commuteSchedule.commute_system_id),
    account_id: parseInt(commuteSchedule.account_id),
    day_of_week: parseInt(commuteSchedule.day_of_week),
    fare_detail_id: parseInt(commuteSchedule.fare_detail_id),
    start_time: commuteSchedule.start_time,
    duration: parseInt(commuteSchedule.duration),
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
        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = commuteScheduleQueries.getCommuteSchedulesByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = commuteScheduleQueries.getCommuteSchedulesById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = commuteScheduleQueries.getCommuteSchedulesByAccountId;
            params = [account_id];
        } else {
            query = commuteScheduleQueries.getCommuteSchedules;
            params = [];
        }

        const commuteSchedule = await executeQuery(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            commuteSchedule.length === 0
        ) {
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
                    commute_schedule_id: curr.commute_schedule_id,
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
                id !== null && id !== undefined
                    ? 'schedule for given id'
                    : account_id !== null && account_id !== undefined
                    ? 'schedule for given account_id'
                    : 'schedules'
            }`,
        );
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
    next: NextFunction,
) => {
    const { account_id, day_of_week, fare_detail_id, start_time, duration } =
        request.body;

    try {
        // Check for overlapping day_of_week and start_time
        const existingSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteScheduleByDayAndTime,
            [account_id, day_of_week, start_time, duration],
        );

        if (existingSchedule.length > 0) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        const rows = await executeQuery(
            commuteScheduleQueries.createCommuteSchedule,
            [account_id, day_of_week, fare_detail_id, start_time, duration],
        );

        const commuteSchedule = rows.map((s) => parseCommuteSchedule(s));

        const fareDetail = await executeQuery(
            fareDetailsQueries.getFareDetailsById,
            [fare_detail_id],
        );

        const cronParams = {
            date: new Date(
                new Date().setHours(
                    start_time.split(':')[0],
                    start_time.split(':')[1],
                    start_time.split(':')[2],
                ),
            ).toISOString(),
            account_id,
            id: commuteSchedule[0].commute_schedule_id,
            amount: -fareDetail[0].fare_amount,
            title: fareDetail[0].system_name + ' ' + fareDetail[0].fare_type,
            description:
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_month: null,
            frequency_day_of_week: day_of_week,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            scriptPath: '/app/scripts/createTransaction.sh',
            type: 'commute',
        };

        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                uniqueId,
                cronDate,
            ])
        )[0].cron_job_id;

        logger.info('Cron job created ' + cronId.toString());

        await executeQuery(commuteScheduleQueries.updateCommuteWithCronJobId, [
            cronId,
            commuteSchedule[0].commute_schedule_id,
        ]);

        request.commute_schedule_id = commuteSchedule[0].commute_schedule_id;

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

    try {
        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [commute_schedule_id],
        );

        const modifiedCommuteSchedule =
            commuteSchedule.map(parseCommuteSchedule);

        response.status(201).json(modifiedCommuteSchedule);
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
    const { account_id, day_of_week, fare_detail_id, start_time, duration } =
        request.body;
    try {
        // Check for overlapping day_of_week and start_time
        const existingSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteScheduleByDayAndTime,
            [account_id, day_of_week, start_time, duration],
        );

        if (existingSchedule.length > 0) {
            response
                .status(400)
                .send(
                    'A schedule with the provided day and time already exists',
                );
            return;
        }

        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [id],
        );

        if (commuteSchedule.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const fareDetail = await executeQuery(
            fareDetailsQueries.getFareDetailsById,
            [fare_detail_id],
        );

        const cronParams = {
            date: new Date(
                new Date().setHours(
                    start_time.split(':')[0],
                    start_time.split(':')[1],
                    start_time.split(':')[2],
                ),
            ).toISOString(),
            account_id,
            id,
            amount: -fareDetail[0].fare_amount,
            title: fareDetail[0].system_name + ' ' + fareDetail[0].fare_type,
            description:
                fareDetail[0].system_name +
                ' ' +
                fareDetail[0].fare_type +
                ' pass',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_month: null,
            frequency_day_of_week: day_of_week,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            scriptPath: '/app/scripts/createTransaction.sh',
            type: 'commute',
        };

        const cronId: number = parseInt(commuteSchedule[0].cron_job_id);
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            logger.error('Cron job not found');
            response.status(404).send('Cron job not found');
            return;
        }

        const { uniqueId, cronDate } = await scheduleCronJob(cronParams);

        await executeQuery(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        const rows = await executeQuery(
            commuteScheduleQueries.updateCommuteSchedule,
            [account_id, day_of_week, fare_detail_id, start_time, duration, id],
        );

        request.commute_schedule_id = id;

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

    try {
        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [commute_schedule_id],
        );

        const modifiedCommuteSchedule =
            commuteSchedule.map(parseCommuteSchedule);

        response.status(200).json(modifiedCommuteSchedule);
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

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            logger.error('Cron job not found');
            response.status(404).send('Cron job not found');
            return;
        }

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
