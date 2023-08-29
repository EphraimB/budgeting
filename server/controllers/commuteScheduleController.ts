import { type Request, type Response } from 'express';
import {
    commuteScheduleQueries,
    commuteTicketQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteSchedule, type CommutePasses } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param commuteSchedule - Commute schedule object to parse
 * @returns - Parsed commute system object
 */
const parseCommuteSchedule = (
    commuteSchedule: Record<string, string>,
): CommuteSchedule => ({
    commute_schedule_id: parseInt(commuteSchedule.commute_schedule_id),
    account_id: parseInt(commuteSchedule.account_id),
    day_of_week: parseInt(commuteSchedule.day_of_week),
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

        const groupedByDay = commuteSchedule.reduce((acc, curr) => {
            const dayOfWeek = curr.day_of_week;
            if (!acc[dayOfWeek]) {
                acc[dayOfWeek] = {
                    day_of_week: dayOfWeek,
                    passes: [],
                };
            }
            acc[dayOfWeek].passes.push({
                type: curr.name,
                start_time: curr.start_time,
                duration: curr.duration,
            });
            return acc;
        }, {});

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
) => {
    const { account_id, day_of_week, commute_ticket_id, start_time, duration } =
        request.body;

    try {
        const rows = await executeQuery(
            commuteScheduleQueries.createCommuteSchedule,
            [account_id, day_of_week, commute_ticket_id, start_time, duration],
        );

        const commuteSchedule = rows.map((s) => parseCommuteSchedule(s));

        response.status(201).json(commuteSchedule);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating schedule');
    }
};

// /**
//  *
//  * @param request - Request object
//  * @param response - Response object
//  * Sends a response with the updated schedule or an error message and updates the schedule in the database
//  */
export const updateCommuteSchedule = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const { account_id, day_of_week, commute_ticket_id, start_time, duration } =
        request.body;
    try {
        const commuteSchedule = await executeQuery(
            commuteScheduleQueries.getCommuteSchedulesById,
            [id],
        );

        if (commuteSchedule.length === 0) {
            response.status(404).send('Schedule not found');
            return;
        }

        const rows = await executeQuery(
            commuteScheduleQueries.updateCommuteSchedule,
            [
                account_id,
                day_of_week,
                commute_ticket_id,
                start_time,
                duration,
                id,
            ],
        );
        const schedule = rows.map((s) => parseCommuteSchedule(s));

        response.status(200).json(schedule);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating schedule');
    }
};

// /**
//  *
//  * @param request - Request object
//  * @param response - Response object
//  * Sends a response with a success message or an error message and deletes the schedule from the database
//  */
// export const deleteCommuteSchedule = async (
//     request: Request,
//     response: Response,
// ): Promise<void> => {
//     const id = parseInt(request.params.id);
//     try {
//         const commuteSchedule = await executeQuery<CommuteScheduleInput>(
//             commuteScheduleQueries.getCommuteScheduleById,
//             [id],
//         );

//         if (commuteSchedule.length === 0) {
//             response.status(404).send('Schedule not found');
//             return;
//         }

//         const ticketResults = await executeQuery(
//             commuteTicketQueries.getCommuteTicketsByAccountId,
//             [commuteSchedule[0].account_id],
//         );
//         const hasTicket: boolean = ticketResults.length > 0;

//         if (hasTicket) {
//             response
//                 .status(400)
//                 .send(
//                     'You need to delete system-related data before deleting the schedule',
//                 );
//             return;
//         }

//         await executeQuery(commuteScheduleQueries.deleteCommuteSchedule, [id]);
//         response.status(200).send('Successfully deleted schedule');
//     } catch (error) {
//         logger.error(error); // Log the error on the server side
//         handleError(response, 'Error deleting schedule');
//     }
// };
