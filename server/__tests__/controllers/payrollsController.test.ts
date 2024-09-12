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
        id: 1,
        name: 'Payroll test',
        payrolls: [
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
        ],
    },
];

describe('GET /api/payrolls', () => {
    it('should respond with an array of payrolls', async () => {
        // Arrange
        mockModule([payrolls], payrolls);

        const { getPayrolls } = await import(
            '../../src/controllers/payrollsController.js'
        );

        // Call the function with the mock request and response
        await getPayrolls(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrolls);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

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
});

describe('GET /api/payrolls/:id', () => {
    it('should respond with a single payroll', async () => {
        // Arrange
        mockModule([payrolls], payrolls);

        const { getPayrollsByJobId } = await import(
            '../../src/controllers/payrollsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getPayrollsByJobId(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrolls[0]);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollsByJobId } = await import(
            '../../src/controllers/payrollsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getPayrollsByJobId(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payrolls',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getPayrollsByJobId } = await import(
            '../../src/controllers/payrollsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await getPayrollsByJobId(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'No payrolls for job or not found',
        );
    });
});
