import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { commuteHistory } from '../../models/mockData';
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
) => {
    const executeQuery =
        errorMessage !== null && errorMessage !== undefined
            ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
            : jest.fn(async () => await Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
        parseFloatOrFallback,
    }));
};

describe('GET /api/expenses/commute/history', () => {
    it('should respond with an array of commute history', async () => {
        // Arrange
        mockModule(commuteHistory);

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Call the function with the mock request and response
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteHistory);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting commute history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Act
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting commute histories',
        });
    });

    it('should respond with an array of commute history with an account_id', async () => {
        // Arrange
        mockModule(
            commuteHistory.filter((history) => history.account_id === 1),
        );

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Call the function with the mock request and response
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteHistory.filter((history) => history.account_id === 1),
        );
    });

    it('should handle errors correctly with an account_id', async () => {
        // Arrange
        const errorMessage =
            'Error getting commute history for given account_id';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Act
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting commute history for given account_id',
        });
    });

    it('should respond with an array of commute history with an id', async () => {
        // Arrange
        mockModule(
            commuteHistory.filter(
                (history) => history.commute_history_id === 1,
            ),
        );

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Call the function with the mock request and response
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteHistory.filter(
                (history) => history.commute_history_id === 1,
            ),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting commute history for given id';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Act
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting commute history',
        });
    });

    it('should respond with a 404 error message when the commute history does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.query = { account_id: 3, id: 3 };

        // Act
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Commute history not found',
        );
    });
});

describe('POST /api/expenses/commute/history', () => {
    it('should respond with the new commute history', async () => {
        const newCommuteHistory = commuteHistory.filter(
            (system) => system.commute_history_id === 1,
        );

        mockModule(newCommuteHistory);

        const { createCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.body = newCommuteHistory;

        await createCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newCommuteHistory);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating commute history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.body = commuteHistory.filter(
            (system) => system.commute_history_id === 1,
        );

        // Act
        await createCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating commute history',
        });
    });
});

describe('PUT /api/expenses/commute/history/:id', () => {
    it('should respond with the updated commute history', async () => {
        const updatedHistory = commuteHistory.filter(
            (history) => history.commute_history_id === 1,
        );

        mockModule(updatedHistory);

        const { updateCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedHistory;

        await updateCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedHistory);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating commute history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteHistory.filter(
            (history) => history.commute_history_id === 1,
        );

        // Act
        await updateCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating commute history',
        });
    });

    it('should respond with a 404 error message when the commute history does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteHistory.filter(
            (history) => history.commute_history_id === 1,
        );

        // Act
        await updateCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Commute history not found',
        );
    });
});

describe('DELETE /api/expenses/commute/history/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted commute history');

        const { deleteCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted commute history',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting commute history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting commute history',
        });
    });

    it('should respond with a 404 error message when the commute history does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteCommuteHistory } = await import(
            '../../controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Commute history not found',
        );
    });
});