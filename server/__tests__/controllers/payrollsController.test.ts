import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule.js';
import { Payroll } from '../../src/types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const payrolls = [
    {
        startDate: '2020-01-01',
        endDate: '2020-01-15',
        workDays: 5,
        grossPay: 500,
        netPay: 400,
        hoursWorked: 40,
    },
    {
        startDate: '2020-01-15',
        endDate: '2020-01-31',
        workDays: 5,
        grossPay: 500,
        netPay: 400,
        hoursWorked: 40,
    },
];

describe('GET /api/payrolls', () => {
    it('should respond with an array of payrolls', async () => {
        // Arrange
        mockModule([payrolls, [{ job_id: 1, job_name: 'Test Job' }]]);

        mockRequest.query = { job_id: 1 };

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
        );

        // Call the function with the mock request and response
        await getPayrolls(mockRequest as Request, mockResponse);

        const expectedPayrolls = {
            jobId: 1,
            jobName: 'Test Job',
            payrolls,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedPayrolls);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { job_id: 1 };

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
        );

        // Call the function with the mock request and response
        await getPayrolls(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting payrolls',
            });
        });
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
        );

        mockRequest.query = { job_id: 3 };

        // Act
        await getPayrolls(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'No payrolls for job or not found',
        );
    });
});
