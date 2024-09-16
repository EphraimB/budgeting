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

describe('GET /api/expenses/commute', () => {
    it('should respond with an overview of commute expenses with an account id provided', async () => {
        // Arrange
        mockModule(
            [
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
            ],
            [
                {
                    accountId: 1,
                    totalCostPerWeek: 100,
                    totalCostPerMonth: 400,
                    systems: [
                        {
                            systemSame: 'BART',
                            totalCostPerWeek: 100,
                            totalCostPerMonth: 400,
                            rides: 10,
                            fareCapProgress: {
                                currentSpent: 50,
                                fareCap: 100,
                                fareCapDuration: 2,
                            },
                        },
                    ],
                },
            ],
        );

        const { getCommuteOverview } = await import(
            '../../src/controllers/commuteOverviewController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getCommuteOverview(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([
            {
                accountId: 1,
                totalCostPerWeek: 100,
                totalCostPerMonth: 400,
                systems: [
                    {
                        systemSame: 'BART',
                        totalCostPerWeek: 100,
                        totalCostPerMonth: 400,
                        rides: 10,
                        fareCapProgress: {
                            currentSpent: 50,
                            fareCap: 100,
                            fareCapDuration: 2,
                        },
                    },
                ],
            },
        ]);
    });

    it('should respond with an overview of commute expenses with no account id provided', async () => {
        // Arrange
        mockModule(
            [
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
            ],
            [
                {
                    account_id: 1,
                    total_cost_per_week: 100,
                    total_cost_per_month: 400,
                    systems: [
                        {
                            system_name: 'BART',
                            total_cost_per_week: 100,
                            total_cost_per_month: 400,
                            rides: 10,
                            fare_cap_progress: {
                                current_spent: 50,
                                fare_cap: 100,
                                fare_cap_duration: 2,
                            },
                        },
                    ],
                },
                {
                    account_id: 2,
                    total_cost_per_week: 0,
                    total_cost_per_month: 0,
                    systems: [],
                },
            ],
        );

        const { getCommuteOverview } = await import(
            '../../src/controllers/commuteOverviewController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getCommuteOverview(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([
            {
                account_id: 1,
                total_cost_per_week: 100,
                total_cost_per_month: 400,
                systems: [
                    {
                        system_name: 'BART',
                        total_cost_per_week: 100,
                        total_cost_per_month: 400,
                        rides: 10,
                        fare_cap_progress: {
                            current_spent: 50,
                            fare_cap: 100,
                            fare_cap_duration: 2,
                        },
                    },
                ],
            },
            {
                account_id: 2,
                total_cost_per_week: 0,
                total_cost_per_month: 0,
                systems: [],
            },
        ]);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteOverview } = await import(
            '../../src/controllers/commuteOverviewController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Act
        await getCommuteOverview(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting commute overview for account 1',
                });
            },
        );
    });
});
