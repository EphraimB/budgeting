import { type Request, type Response } from 'express';
import {
    commuteTicketQueries,
    fareDetailsQueries,
} from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type CommuteTicket } from '../types/types.js';
import { logger } from '../config/winston.js';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../utils/helperFunctions.js';

interface CommuteTicketInput {
    commute_ticket_id: string;
    account_id: string;
    fare_detail_id: string;
    name: string;
    alternate_ticket_id: string | null;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param commuteTicket - Commute ticket object to parse
 * @returns - Parsed commute ticket object
 */
const parseCommuteTicket = (
    commuteTicket: CommuteTicketInput,
): CommuteTicket => ({
    commute_ticket_id: parseInt(commuteTicket.commute_ticket_id),
    account_id: parseInt(commuteTicket.account_id),
    fare_detail_id: parseInt(commuteTicket.fare_detail_id),
    name: commuteTicket.name,
    alternate_ticket_id: parseIntOrFallback(commuteTicket.alternate_ticket_id),
    date_created: commuteTicket.date_created,
    date_modified: commuteTicket.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with all commute tickets or a single ticket
 */
export const getCommuteTicket = async (
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
            query = commuteTicketQueries.getCommuteTicketsByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = commuteTicketQueries.getCommuteTicketsById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = commuteTicketQueries.getCommuteTicketsByAccountId;
            params = [account_id];
        } else {
            query = commuteTicketQueries.getCommuteTickets;
            params = [];
        }

        const commuteTicket = await executeQuery<CommuteTicketInput>(
            query,
            params,
        );

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            commuteTicket.length === 0
        ) {
            response.status(404).send('Ticket not found');
            return;
        }

        response.status(200).json(commuteTicket.map(parseCommuteTicket));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'ticket for given id'
                    : account_id !== null && account_id !== undefined
                    ? 'ticket for given account_id'
                    : 'tickets'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 *  Sends a response with the created ticket or an error message and posts the ticket to the database
 */
export const createCommuteTicket = async (
    request: Request,
    response: Response,
) => {
    const { account_id, fare_detail_id, alternate_ticket_id } = request.body;

    try {
        const fareDetailsResults = await executeQuery(
            fareDetailsQueries.getFareDetailsByAccountId,
            [account_id],
        );
        const hasFareDetails: boolean = fareDetailsResults.length > 0;

        if (hasFareDetails === false) {
            response.status(400).send({
                errors: {
                    msg: 'You need to create a fare detail before creating a ticket',
                    param: null,
                    location: 'query',
                },
            });
            return;
        }

        const rows = await executeQuery<CommuteTicketInput>(
            commuteTicketQueries.createCommuteTicket,
            [account_id, fare_detail_id, alternate_ticket_id],
        );
        const commuteTicket = rows.map((ct) => parseCommuteTicket(ct));
        response.status(201).json(commuteTicket);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating ticket');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated ticket or an error message and updates the ticket in the database
 */
export const updateCommuteTicket = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    const { account_id, fare_detail_id, alternate_ticket_id } = request.body;
    try {
        const commuteTicket = await executeQuery<CommuteTicketInput>(
            commuteTicketQueries.getCommuteTicketsById,
            [id],
        );

        if (commuteTicket.length === 0) {
            response.status(404).send('Ticket not found');
            return;
        }

        const rows = await executeQuery<CommuteTicketInput>(
            commuteTicketQueries.updateCommuteTicket,
            [account_id, fare_detail_id, alternate_ticket_id, id],
        );
        const tickets = rows.map((ticket) => parseCommuteTicket(ticket));
        response.status(200).json(tickets);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating ticket');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with a success message or an error message and deletes the ticket from the database
 */
export const deleteCommuteTicket = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const id = parseInt(request.params.id);
    try {
        const commuteTicket = await executeQuery<CommuteTicketInput>(
            commuteTicketQueries.getCommuteTicketsById,
            [id],
        );

        if (commuteTicket.length === 0) {
            response.status(404).send('Ticket not found');
            return;
        }

        await executeQuery(commuteTicketQueries.deleteCommuteTicket, [id]);
        response.status(200).send('Successfully deleted ticket');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting ticket');
    }
};
