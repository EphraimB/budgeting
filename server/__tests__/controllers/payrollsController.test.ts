import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { payrolls } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let consoleSpy: any;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
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

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/payrolls', () => {
    it('should respond with an array of payrolls', async () => {
        // Arrange
        mockModule(payrolls);

        mockRequest.query = { employee_id: 1 };

        const { getPayrolls } = await import(
            '../../controllers/payrollsController.js'
        );

        // Call the function with the mock request and response
        await getPayrolls(mockRequest as Request, mockResponse);

        const expectedPayrolls = {
            employee_id: 1,
            payrolls,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedPayrolls);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting payrolls';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1 };

        const { getPayrolls } = await import(
            '../../controllers/payrollsController.js'
        );

        // Call the function with the mock request and response
        await getPayrolls(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payrolls',
        });

        // Check if console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getPayrolls } = await import(
            '../../controllers/payrollsController.js'
        );

        mockRequest.query = { employee_id: 3 };

        // Act
        await getPayrolls(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'No payrolls for employee or not found',
        );
    });
});
