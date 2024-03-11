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

describe('GET /api/expenses/commute', () => {
    it('should respond with an overview of commute expenses', async () => {
        // Arrange
        mockModule([
            [
                {
                    account_id: 1,
                    total_cost_per_week: 100,
                    total_cost_per_month: 400,
                    commute_system_id: 1,
                    system_name: 'BART',
                    rides: 10,
                    fare_cap: 100,
                    fare_cap_duration: 2,
                    current_spent: 50,
                },
            ],
        ]);

        const { getCommuteOverview } = await import(
            '../../src/controllers/commuteOverviewController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getCommuteOverview(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            account_id: 1,
            total_cost_per_week: 100,
            total_cost_per_month: 400,
            systems: {
                BART: {
                    total_cost_per_week: 100,
                    total_cost_per_month: 400,
                    rides: 10,
                    fare_cap_progress: {
                        current_spent: 50,
                        fare_cap: 100,
                        fare_cap_duration: 2,
                    },
                },
            },
        });
    });

    it('should respond with a 404 if the account does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getCommuteOverview } = await import(
            '../../src/controllers/commuteOverviewController.js'
        );

        mockRequest.query = { account_id: 2 };

        // Call the function with the mock request and response
        await getCommuteOverview(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account does not exist',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting commute overview for account 1';
        mockModule([], [errorMessage]);

        const { getCommuteOverview } = await import(
            '../../src/controllers/commuteOverviewController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Act
        await getCommuteOverview(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting commute overview for account 1',
        });
    });
});
