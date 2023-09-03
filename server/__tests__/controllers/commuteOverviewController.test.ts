import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { type QueryResultRow } from 'pg';

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
    }));
};

describe('GET /api/expenses/commute', () => {
    it('should respond with an overview of commute expenses', async () => {
        // Arrange
        mockModule([
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
        ]);

        const { getCommuteOverview } = await import(
            '../../controllers/commuteOverviewController.js'
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
                        potential_savings: 50,
                        fare_cap_duration: 2,
                    },
                },
            },
        });
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting commute overview for account 1';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteOverview } = await import(
            '../../controllers/commuteOverviewController.js'
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
