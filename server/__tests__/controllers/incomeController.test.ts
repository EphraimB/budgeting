import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { accounts, income } from '../../models/mockData.js';
import { QueryResultRow } from 'pg';

jest.mock('../../crontab/scheduleCronJob.js', () => {
    return jest.fn().mockImplementation(() => Promise.resolve({ cronDate: '0 0 16 * *', uniqueId: '123' }));
});

jest.mock('../../crontab/deleteCronJob.js', () => {
    return jest.fn().mockImplementation(() => Promise.resolve('123'));
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

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
const mockModule = (
    executeQueryValueFirst: QueryResultRow[] | string | null,
    errorMessage?: string,
    executeQueryValueSecond?: QueryResultRow[] | string | null,
    executeQueryValueThird?: QueryResultRow[] | string | null,
    executeQueryValueFourth?: QueryResultRow[] | string | null
) => {
    const executeQuery = jest.fn();

    if (errorMessage) {
        executeQuery.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    } else {
        executeQuery.mockImplementationOnce(() => Promise.resolve(executeQueryValueFirst));
        if (executeQueryValueSecond !== undefined) {
            executeQuery.mockImplementationOnce(() => Promise.resolve(executeQueryValueSecond));

            if (executeQueryValueThird !== undefined) {
                executeQuery.mockImplementationOnce(() => Promise.resolve(executeQueryValueThird));

                if (executeQueryValueFourth !== undefined) {
                    executeQuery.mockImplementationOnce(() => Promise.resolve(executeQueryValueFourth));
                }
            }
        }
    }

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        })
    }));
};

describe('GET /api/income', () => {
    it('should respond with an array of income', async () => {
        // Arrange
        mockModule(income);

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { id: null };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of income with id', async () => {
        // Arrange
        mockModule(income.filter(inc => inc.income_id === 1));

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income.filter(inc => inc.income_id === 1));
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of income with account id', async () => {
        // Arrange
        mockModule(income.filter(inc => inc.account_id === 1));

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income.filter(inc => inc.account_id === 1));
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { account_id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting income for given account_id' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of income with account id and id', async () => {
        // Arrange
        mockModule(income.filter(inc => inc.account_id === 1 && inc.income_id === 1));

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { account_id: 1, id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income.filter(inc => inc.account_id === 1 && inc.income_id === 1));
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { account_id: 1, id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the income does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import('../../controllers/incomeController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });
});

describe('POST /api/income', () => {
    it('should populate the request.income_id', async () => {
        // Arrange
        const newIncome = income.filter(inc => inc.income_id === 1);

        mockModule(newIncome, undefined, '1', []);

        const { createIncome } = await import('../../controllers/incomeController.js');

        mockRequest.body = newIncome;

        await createIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.income_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createIncome } = await import('../../controllers/incomeController.js');

        mockRequest.body = income.filter(inc => inc.income_id === 1);

        // Act
        await createIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should handle errors correctly in return object', async () => {
        // Arrange
        const errorMessage = 'Error creating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createIncomeReturnObject } = await import('../../controllers/incomeController.js');

        mockRequest.body = income.filter(inc => inc.income_id === 1);

        // Act
        await createIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of income', async () => {
        // Arrange
        const newIncome = income.filter(inc => inc.income_id === 1);

        mockModule(newIncome);

        const { createIncomeReturnObject } = await import('../../controllers/incomeController.js');

        mockRequest.body = newIncome;

        // Call the function with the mock request and response
        await createIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newIncome);
    });
});

describe('PUT /api/income/:id', () => {
    it('should call next in the middleware', async () => {
        const updatedIncome = income.filter(inc => inc.income_id === 1);

        mockModule(updatedIncome, undefined, '1', []);

        const { updateIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedIncome;

        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.income_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = income.filter(inc => inc.income_id === 1);

        // Act
        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should handle errors correctly in the return object function', async () => {
        // Arrange
        const errorMessage = 'Error updating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateIncomeReturnObject } = await import('../../controllers/incomeController.js');

        mockRequest.body = income.filter(inc => inc.income_id === 1);

        // Act
        await updateIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(account => account.account_id === 1);

        // Act
        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });

    it('should return a 404 when the cron job is not found', async () => {
        // Arrange
        mockModule(income.filter(inc => inc.income_id === 1), undefined, []);

        const { updateIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = income.filter(inc => inc.income_id === 1);

        // Act
        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });

    it('should respond with an array of income', async () => {
        // Arrange
        const newIncome = income.filter(inc => inc.income_id === 1);

        mockModule(newIncome);

        const { updateIncomeReturnObject } = await import('../../controllers/incomeController.js');

        mockRequest.body = newIncome;

        // Call the function with the mock request and response
        await updateIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(newIncome);
    });
});

describe('DELETE /api/income/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule([{
            income_id: 1,
            account_id: 1,
            cron_job_id: 1,
            tax_id: 1,
            tax_rate: 1,
            income_amount: 1,
            income_title: 'test',
            income_description: 'test',
            date_created: 'test',
            date_modified: 'test',
        }], undefined, '1', [{ unique_id: 'wo4if43' }], []);

        const { deleteIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };

        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting income' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });

    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Income deleted successfully');

        const { deleteIncomeReturnObject } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await deleteIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Income deleted successfully');
    });

    it('should return a 404 when the cron job is not found', async () => {
        // Arrange
        mockModule(income.filter(inc => inc.income_id === 1), undefined, [], []);

        const { deleteIncome } = await import('../../controllers/incomeController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = income.filter(inc => inc.income_id === 1);

        // Act
        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });
});
