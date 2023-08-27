import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import {
    commuteSystems,
    commuteTickets,
    fareDetails,
} from '../../models/mockData';
import { type QueryResultRow } from 'pg';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../utils/helperFunctions';

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
    },
}));

// Mock request and response
let mockRequest: any;
let mockResponse: any;

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
});

afterEach(() => {
    jest.resetModules();
});

/**
 *
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    executeQueryValue: QueryResultRow[] | string | null,
    errorMessage?: string,
    executeQueryTwoValue?: QueryResultRow[] | string | null,
    executeQueryThreeValue?: QueryResultRow[] | string | null,
) => {
    const executeQuery = jest.fn();

    if (errorMessage) {
        executeQuery.mockReturnValueOnce(
            Promise.reject(new Error(errorMessage)),
        );
    } else {
        executeQuery.mockReturnValueOnce(Promise.resolve(executeQueryValue));
    }

    if (executeQueryTwoValue) {
        executeQuery.mockReturnValueOnce(Promise.resolve(executeQueryTwoValue));
    }

    if (executeQueryThreeValue) {
        executeQuery.mockReturnValueOnce(
            Promise.resolve(executeQueryThreeValue),
        );
    }

    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
        parseFloatOrFallback,
    }));
};

describe('GET /api/expenses/commute/tickets', () => {
    it('should respond with an array of tickets', async () => {
        // Arrange
        mockModule(commuteTickets);

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Call the function with the mock request and response
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteTickets);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting tickets';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Act
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting tickets',
        });
    });

    it('should respond with an array of tickets with an account_id', async () => {
        // Arrange
        mockModule(commuteTickets.filter((ticket) => ticket.account_id === 1));

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Call the function with the mock request and response
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteTickets.filter((ticket) => ticket.account_id === 1),
        );
    });

    it('should handle errors correctly with an account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting tickets';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Act
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting ticket for given account_id',
        });
    });

    it('should respond with an array of tickets with an id', async () => {
        // Arrange
        mockModule(
            commuteTickets.filter((ticket) => ticket.commute_ticket_id === 1),
        );

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Call the function with the mock request and response
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteTickets.filter((ticket) => ticket.commute_ticket_id === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting tickets';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Act
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting ticket for given id',
        });
    });

    it('should respond with a 404 error message when the ticket does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.query = { account_id: 3, id: 3 };

        // Act
        await getCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Ticket not found');
    });
});

describe('POST /api/expenses/commute/tickets', () => {
    it('should respond with the new ticket', async () => {
        const newTicket = commuteTickets.filter(
            (ticket) => ticket.commute_ticket_id === 1,
        );

        mockModule(commuteSystems, undefined, newTicket);

        const { createCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.body = newTicket;

        await createCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTicket);
    });

    it('should respond with a 400 error for not creating the parent fare detail', async () => {
        const newTicket = commuteTickets.filter(
            (ticket) => ticket.commute_ticket_id === 1,
        );

        mockModule([], undefined, newTicket);

        const { createCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.body = newTicket;

        await createCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'You need to create a fare detail before creating a ticket',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating ticket';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.body = commuteTickets.filter(
            (ticket) => ticket.commute_ticket_id === 1,
        );

        // Act
        await createCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating ticket',
        });
    });
});

describe('PUT /api/expenses/commute/tickets/:id', () => {
    it('should respond with the updated ticket', async () => {
        const updatedTicket = commuteTickets.filter(
            (ticket) => ticket.commute_ticket_id === 1,
        );

        mockModule(commuteSystems, undefined, fareDetails, updatedTicket);

        const { updateCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTicket;

        await updateCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedTicket);
    });

    it('should respond with a 400 error for not creating the parent fare detail', async () => {
        const updatedTicket = commuteTickets.filter(
            (ticket) => ticket.commute_ticket_id === 1,
        );

        mockModule(commuteSystems, undefined, [], updatedTicket);

        const { updateCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTicket;

        await updateCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'You need to create a fare detail before creating a ticket',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating ticket';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteTickets.filter(
            (ticket) => ticket.commute_ticket_id === 1,
        );

        // Act
        await updateCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating ticket',
        });
    });

    it('should respond with a 404 error message when the ticket does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteTickets.filter(
            (system) => system.commute_ticket_id === 1,
        );

        // Act
        await updateCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Ticket not found');
    });
});

describe('DELETE /api/expenses/commute/tickets/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted ticket');

        const { deleteCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted ticket',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting ticket';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting ticket',
        });
    });

    it('should respond with a 404 error message when the ticket does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteCommuteTicket } = await import(
            '../../controllers/commuteTicketsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteTicket(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Ticket not found');
    });
});
