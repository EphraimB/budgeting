import { type Request, type Response } from 'express';
import {
    commuteScheduleQueries,
    commutePassesQueries,
    commuteTicketQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteSchedule, type CommutePasses } from '../types/types.js';
import { logger } from '../config/winston.js';

interface CommuteScheduleInput {
    commute_schedule_id: string;
    account_id: string;
    day_of_week: string;
    date_created: string;
    date_modified: string;
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
            query = commutePassesQueries.getCommutePassesByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = commutePassesQueries.getCommutePassesById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = commutePassesQueries.getCommutePassesByAccountId;
            params = [account_id];
        } else {
            query = commutePassesQueries.getCommutePasses;
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

        const responseObj: {
            schedule: Array<{
                day_of_week: number;
                passes: Array<{
                    type: string;
                    start_time: string;
                    duration: number;
                }>;
            }>;
        } = {
            schedule: [],
        };

        const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // 0=Sunday, 1=Monday, ..., 6=Saturday

        daysOfWeek.forEach((day) => {
            const passesForDay = commuteSchedule.filter(
                (cs) => cs.day_of_week === day,
            );
            const passes = passesForDay.map((cs) => ({
                type: cs.name, // assuming `name` is the type of pass
                start_time: cs.start_time,
                duration: cs.duration,
            }));
            responseObj.schedule.push({
                day_of_week: day,
                passes: passes,
            });
        });

        response.status(200).json(commuteSchedule.map(parseCommuteSchedule));
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
// export const createCommuteSchedule = async (
//     request: Request,
//     response: Response,
// ) => {
//     const {
//         account_id,
//         commute_ticket_id,
//         day_of_week,
//         time_of_day,
//         duration,
//     } = request.body;

//     try {
//         const rows = await executeQuery<CommuteScheduleInput>(
//             commuteScheduleQueries.createCommuteSchedule,
//             [account_id, commute_ticket_id, day_of_week, time_of_day, duration],
//         );
//         const commuteSchedule = rows.map((cs) => parseCommuteSchedule(cs));
//         response.status(201).json(commuteSchedule);
//     } catch (error) {
//         logger.error(error); // Log the error on the server side
//         handleError(response, 'Error creating schedule');
//     }
// };

// /**
//  *
//  * @param request - Request object
//  * @param response - Response object
//  * Sends a response with the updated schedule or an error message and updates the schedule in the database
//  */
// export const updateCommuteSchedule = async (
//     request: Request,
//     response: Response,
// ): Promise<void> => {
//     const id = parseInt(request.params.id);
//     const {
//         account_id,
//         commute_ticket_id,
//         day_of_week,
//         time_of_day,
//         duration,
//     } = request.body;
//     try {
//         const commuteSchedule = await executeQuery<CommuteScheduleInput>(
//             commuteScheduleQueries.getCommuteScheduleById,
//             [id],
//         );

//         if (commuteSchedule.length === 0) {
//             response.status(404).send('Schedule not found');
//             return;
//         }

//         const rows = await executeQuery<CommuteScheduleInput>(
//             commuteScheduleQueries.updateCommuteSchedule,
//             [commute_ticket_id, day_of_week, time_of_day, duration, , id],
//         );
//         const schedule = rows.map((s) => parseCommuteSchedule(s));
//         response.status(200).json(schedule);
//     } catch (error) {
//         logger.error(error); // Log the error on the server side
//         handleError(response, 'Error updating schedule');
//     }
// };

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
