import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';
import { CommuteHistory } from '../../src/types/types.js';

jest.mock('../../src/config/winston', () => ({
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

const commuteHistory = [
    {
        id: 1,
        accountId: 1,
        fare: 2.75,
        commuteSystem: 'OMNY',
        fareType: 'Single Ride',
        timestamp: '2020-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        accountId: 1,
        fare: 9.75,
        commuteSystem: 'LIRR',
        fareType: 'Off-Peak',
        timestamp: '2020-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/expenses/commute/history', () => {
    it('should respond with an array of commute history', async () => {
        // Arrange
        mockModule([commuteHistory], commuteHistory);

        const { getCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteHistory);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.query = { accountId: null };

        // Act
        await getCommuteHistory(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting commute histories',
                });
            },
        );
    });

    it('should respond with an array of commute history with an account id', async () => {
        // Arrange
        mockModule(
            [commuteHistory.filter((history) => history.accountId === 1)],
            commuteHistory.filter((history) => history.accountId === 1),
        );

        const { getCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteHistory.filter((history) => history.accountId === 1),
        );
    });

    it('should handle errors correctly with an account id', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Act
        await getCommuteHistory(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message:
                        'Error getting commute history for given account id',
                });
            },
        );
    });
});

describe('GET /api/expenses/commute/history/:id', () => {
    it('should respond with an array of commute history with an id', async () => {
        // Arrange
        mockModule(
            [
                commuteHistory.filter(
                    (commuteHistory) => commuteHistory.id === 1,
                ),
            ],
            commuteHistory.filter((commuteHistory) => commuteHistory.id === 1),
        );

        const { getCommuteHistoryById } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getCommuteHistoryById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteHistory.filter(
                (commuteHistory) => commuteHistory.id === 1,
            )[0],
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteHistoryById } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Act
        await getCommuteHistoryById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting commute history',
                });
            },
        );
    });

    it('should respond with a 404 error message when the commute history does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getCommuteHistoryById } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: 3 };

        // Act
        await getCommuteHistoryById(mockRequest as Request, mockResponse);

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
            (commuteHistory) => commuteHistory.id === 1,
        );

        mockModule([newCommuteHistory], newCommuteHistory);

        const { createCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.body = newCommuteHistory;

        await createCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteHistory.filter((commuteHistory) => commuteHistory.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.body = commuteHistory.filter(
            (commuteHistory) => commuteHistory.id === 1,
        );

        // Act
        await createCommuteHistory(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error creating commute history',
                });
            },
        );
    });
});

describe('PUT /api/expenses/commute/history/:id', () => {
    it('should respond with the updated commute history', async () => {
        const updatedHistory = commuteHistory.filter(
            (commuteHistory) => commuteHistory.id === 1,
        );

        mockModule([[{ id: 1 }], updatedHistory], updatedHistory);

        const { updateCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedHistory;

        await updateCommuteHistory(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteHistory.filter((commuteHistory) => commuteHistory.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteHistory.filter(
            (commuteHistory) => commuteHistory.id === 1,
        );

        // Act
        await updateCommuteHistory(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error updating commute history',
                });
            },
        );
    });

    it('should respond with a 404 error message when the commute history does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteHistory.filter(
            (commuteHistory) => commuteHistory.id === 1,
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
        mockModule([[{ id: 1 }], []]);

        const { deleteCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
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
        mockModule([]);

        const { deleteCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteHistory(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting commute history',
                });
            },
        );
    });

    it('should respond with a 404 error message when the commute history does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteCommuteHistory } = await import(
            '../../src/controllers/commuteHistoryController.js'
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
