import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { payrollDates } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';
import { type PayrollDate } from '../../types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

jest.mock('child_process', () => {
    return {
        exec: jest.fn(
            (
                command: string,
                callback: (
                    error: Error | null,
                    stdout: string,
                    stderr: string,
                ) => void,
            ) => {
                callback(null, 'mock stdout', 'mock stderr');
            },
        ),
    };
});

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
    mockNext = jest.fn();
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

const payrollDatesReturnObj: PayrollDate[] = payrollDates.map(
    (payrollDate: PayrollDate) => ({
        payroll_date_id: payrollDate.payroll_date_id,
        employee_id: payrollDate.employee_id,
        payroll_start_day: payrollDate.payroll_start_day,
        payroll_end_day: payrollDate.payroll_end_day,
    }),
);

describe('GET /api/payroll/dates', () => {
    it('should respond with an array of payroll dates', async () => {
        // Arrange
        mockModule(payrollDates);

        mockRequest.query = { id: null, employee_id: null };

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesReturnObj);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting payroll dates';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: null, employee_id: null };

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll dates',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll dates with id', async () => {
        // Arrange
        mockModule(
            payrollDates.filter((payrollDate) => payrollDate.employee_id === 1),
        );

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: 1, employee_id: null };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesReturnObj);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: 1, employee_id: null };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll dates with employee_id', async () => {
        // Arrange
        const employee_id = 1;

        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.employee_id === employee_id,
            ),
        );

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: null, employee_id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesReturnObj);
    });

    it('should respond with an error message with employee_id', async () => {
        // Arrange
        const employee_id = 1;

        const errorMessage = 'Error getting payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: null, employee_id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll dates for given employee_id',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll dates with id and employee_id', async () => {
        // Arrange
        const id = 1;
        const employee_id = 1;

        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.employee_id === employee_id,
            ),
        );

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id, employee_id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesReturnObj);
    });

    it('should respond with an error message with id and employee_id', async () => {
        // Arrange
        const id = 1;
        const employee_id = 1;

        const errorMessage = 'Error getting payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id, employee_id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Payroll date not found',
        );
    });
});

describe('POST /api/payroll/dates', () => {
    it('should populate request.payroll_date_id', async () => {
        // Arrange
        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.payroll_date_id === 1,
            ),
        );

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.body = newPayrollDate;

        await createPayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.payroll_date_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.body = newPayrollDate;

        await createPayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 500 error if the script cannot execute', async () => {
        // Arrange
        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.payroll_date_id === 1,
            ),
        );

        jest.mock('child_process', () => ({
            exec: jest.fn(
                (
                    _: string,
                    callback: (
                        error: Error | null,
                        stdout: string | Buffer | null,
                        stderr: string | Buffer | null,
                    ) => void,
                ) => {
                    callback(new Error('Test error'), null, null);
                },
            ),
        }));

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.body = newPayrollDate;

        await createPayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Error executing script',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDateReturnObject } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.body = newPayrollDate;

        await createPayrollDateReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with the created payroll date', async () => {
        // Arrange
        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.payroll_date_id === 1,
            ),
        );

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDateReturnObject } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.body = newPayrollDate;

        await createPayrollDateReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith([
            payrollDatesReturnObj[0],
        ]);
    });
});

describe('PUT /api/payroll/dates/:id', () => {
    it('should call next on the middlware', async () => {
        // Arrange
        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.payroll_date_id === 1,
            ),
        );

        const updatedPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { updatePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollDate;

        await updatePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const updatedPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { updatePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollDate;

        await updatePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const updatedPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { updatePayrollDateReturnObject } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollDate;

        await updatePayrollDateReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updatePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.payroll_date_id === 1,
        );

        // Act
        await updatePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Payroll date not found',
        );
    });

    it('should return a 500 error if the script cannot execute', async () => {
        // Arrange
        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.payroll_date_id === 1,
            ),
        );

        jest.mock('child_process', () => ({
            exec: jest.fn(
                (
                    _: string,
                    callback: (
                        error: Error | null,
                        stdout: string | Buffer | null,
                        stderr: string | Buffer | null,
                    ) => void,
                ) => {
                    callback(new Error('Test error'), null, null);
                },
            ),
        }));

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.body = newPayrollDate;

        await createPayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Error executing script',
        );
    });

    it('should respond with the updated payroll date', async () => {
        // Arrange
        mockModule(
            payrollDates.filter(
                (payrollDate) => payrollDate.payroll_date_id === 1,
            ),
        );

        const updatedPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { updatePayrollDateReturnObject } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollDate;

        await updatePayrollDateReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([
            payrollDatesReturnObj[0],
        ]);
    });
});

describe('DELETE /api/payroll/dates/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule('Successfully deleted payroll date');

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        const { deletePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error deleting payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        const { deletePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting payroll date',
        });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deletePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { employee_id: 1 };

        // Act
        await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Payroll date not found',
        );
    });

    it('should return a 500 error if the script cannot execute', async () => {
        // Arrange
        mockModule('Successfully deleted payroll date');

        jest.mock('child_process', () => ({
            exec: jest.fn(
                (
                    _: string,
                    callback: (
                        error: Error | null,
                        stdout: string | Buffer | null,
                        stderr: string | Buffer | null,
                    ) => void,
                ) => {
                    callback(new Error('Test error'), null, null);
                },
            ),
        }));

        const { deletePayrollDate } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Error executing script',
        );
    });

    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted payroll date');

        const { deletePayrollDateReturnObject } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        // Act
        await deletePayrollDateReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted payroll date',
        );
    });
});
