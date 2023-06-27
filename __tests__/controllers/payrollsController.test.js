import { jest } from '@jest/globals';
import { payrolls } from '../../models/mockData.js';

// Mock request and response
let mockRequest;
let mockResponse;
let consoleSpy;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
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

// Helper function to generate mock module
const mockModule = (executeQueryValue, errorMessage) => {
    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: errorMessage
            ? jest.fn().mockRejectedValue(new Error(errorMessage))
            : jest.fn().mockResolvedValue(executeQueryValue),
        handleError: jest.fn((res, message) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/payrolls', () => {
    it('should respond with an array of payrolls', async () => {
        // Arrange
        mockModule(payrolls);

        mockRequest.query = { employee_id: 1 };

        const { getPayrolls } = await import('../../controllers/payrollsController.js');

        // Call the function with the mock request and response
        await getPayrolls(mockRequest, mockResponse);

        const expectedPayrolls = {
            employee_id: 1,
            payrolls
        }

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

        const { getPayrolls } = await import('../../controllers/payrollsController.js');

        // Call the function with the mock request and response
        await getPayrolls(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payrolls' });

        // Check if console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});