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

jest.mock('../../config/winston', () => ({
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

const payrolls: Payroll[] = [
    {
        start_date: '2020-01-01',
        end_date: '2020-01-15',
        work_days: 5,
        gross_pay: 500,
        net_pay: 400,
        hours_worked: 40,
    },
    {
        start_date: '2020-01-15',
        end_date: '2020-01-31',
        work_days: 5,
        gross_pay: 500,
        net_pay: 400,
        hours_worked: 40,
    },
];

describe('GET /api/payrolls', () => {
    it('should respond with an array of payrolls', async () => {
        // Arrange
        mockModule([payrolls]);

        mockRequest.query = { employee_id: 1 };

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
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
        mockModule([], [errorMessage]);

        mockRequest.query = { employee_id: 1 };

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
        );

        // Call the function with the mock request and response
        await getPayrolls(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payrolls',
        });
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
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
