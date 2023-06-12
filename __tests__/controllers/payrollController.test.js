import { jest } from '@jest/globals';
import { payrolls } from '../../models/mockData.js';

jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue(payrolls),
    handleError: jest.fn().mockReturnValue({ message: 'Error' }),
}));

const { getPayrolls } = await import('../../controllers/payrollsController.js');

let mockRequest = {};
let mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),  // Mock send method
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/payrolls', () => {
    it('should respond with an array of payrolls', async () => {
        mockRequest = {
            query: {
                employee_id: 1
            }
        }; // Set the mockRequest.query

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
});