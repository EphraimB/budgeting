import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { payrollTaxes } from '../../models/mockData.js';
import { QueryResultRow } from 'pg';
import { PayrollTax } from '../../types/types.js';

let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

jest.mock('child_process', () => {
    return {
        exec: jest.fn((command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
            callback(null, 'mock stdout', 'mock stderr');
        })
    };
});

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
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
const mockModule = (executeQueryValue: QueryResultRow[] | string | null, errorMessage?: string) => {
    const executeQuery = errorMessage
        ? jest.fn(() => Promise.reject(new Error(errorMessage)))
        : jest.fn(() => Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

const payrollTaxesReturnObj: PayrollTax[] = payrollTaxes.map((payrollTax: PayrollTax) => ({
    payroll_taxes_id: payrollTax.payroll_taxes_id,
    employee_id: payrollTax.employee_id,
    name: payrollTax.name,
    rate: payrollTax.rate
}));

describe('GET /api/payroll/taxes', () => {
    it('should respond with an array of payroll taxes', async () => {
        mockModule(payrollTaxes);

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error getting payroll taxes';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: null, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll taxes' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll taxes with id', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.employee_id === id));

        mockRequest.query = { employee_id: id, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message with id', async () => {
        const errorMessage = 'Error getting payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: null, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should response with an array of payroll taxes with employee_id', async () => {
        const employee_id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id));

        mockRequest.query = { employee_id, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message with employee_id', async () => {
        const errorMessage = 'Error getting payroll taxes';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll taxes for given employee_id' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll taxes with employee_id and id', async () => {
        const employee_id = 1;
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id && payrollTax.payroll_taxes_id === id));

        mockRequest.query = { employee_id, id };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id && payrollTax.payroll_taxes_id === id));
    });

    it('should respond with an error message with employee_id and id', async () => {
        const errorMessage = 'Error getting payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('POST /api/payroll/taxes', () => {
    it('should populate payroll_tax_id', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === id));

        const newPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.15
        };

        mockRequest.body = newPayrollTax;

        const { createPayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await createPayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.payroll_taxes_id).toBe(id);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error creating payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const newPayrollTax = {
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.15
        };

        mockRequest.body = newPayrollTax;

        const { createPayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await createPayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/payroll/taxes/:id', () => {
    it('should call next on the middleware', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === id));

        const updatedPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.1
        };

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollTax;

        const { updatePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

        const newPayrollTaxesReturnObj = [{
            payroll_taxes_id: id,
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.1
        }];

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error updating payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const updatedPayrollTax = {
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.1
        };

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollTax;

        const { updatePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updatePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === 1);

        // Act
        await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('DELETE /api/payroll/taxes/:id', () => {
    it('should call next on the middleware', async () => {
        mockModule('Successfully deleted payroll tax');

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        const { deletePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error deleting payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 3 };

        const { deletePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deletePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        mockRequest.params = { id: 3 };
        mockRequest.query = { employee_id: 1 };

        // Act
        await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});
