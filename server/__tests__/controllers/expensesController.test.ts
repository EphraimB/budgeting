import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { accounts, expenses } from '../../models/mockData.js';
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

describe('GET /api/expenses', () => {
    it('should respond with an array of expenses', async () => {
        // Arrange
        mockModule(expenses);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting expenses';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: null };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expenses' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of expenses with id', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.expense_id === 1));

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses.filter(expense => expense.expense_id === 1));
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of expenses with account id', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.account_id === 1));

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses.filter(expense => expense.account_id === 1));
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { account_id: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expenses for given account_id' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of expenses with account id and id', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.account_id === 1 && expense.expense_id === 1));

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { account_id: 1, id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses.filter(expense => expense.account_id === 1 && expense.expense_id === 1));
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { account_id: 1, id: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });
});

describe('POST /api/expenses', () => {
    it('should populate the request.expense_id', async () => {
        // Arrange
        const newExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(newExpense, undefined, '1', []);

        const { createExpense } = await import('../../controllers/expensesController.js');

        mockRequest.body = newExpense;

        await createExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.expense_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createExpense } = await import('../../controllers/expensesController.js');

        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await createExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should handle errors correctly in return object', async () => {
        // Arrange
        const errorMessage = 'Error creating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createExpenseReturnObject } = await import('../../controllers/expensesController.js');

        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await createExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of expenses', async () => {
        // Arrange
        const newExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(newExpense);

        const { createExpenseReturnObject } = await import('../../controllers/expensesController.js');

        mockRequest.body = newExpense;

        // Call the function with the mock request and response
        await createExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
    });
});

describe('PUT /api/expenses/:id', () => {
    it('should call next in the middleware', async () => {
        const updatedExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(updatedExpense, undefined, '1', []);

        const { updateExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedExpense;

        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.expense_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should handle errors correctly in the return object function', async () => {
        // Arrange
        const errorMessage = 'Error updating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateExpenseReturnObject } = await import('../../controllers/expensesController.js');

        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await updateExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(account => account.account_id === 1);

        // Act
        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });

    it('should return a 404 when the cron job is not found', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.expense_id === 1), undefined, []);

        const { updateExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });

    it('should respond with an array of expenses', async () => {
        // Arrange
        const newExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(newExpense);

        const { updateExpenseReturnObject } = await import('../../controllers/expensesController.js');

        mockRequest.body = newExpense;

        // Call the function with the mock request and response
        await updateExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
    });
});

describe('DELETE /api/expenses/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule([{
            expense_id: 1,
            account_id: 1,
            cron_job_id: 1,
            tax_id: 1,
            tax_rate: 1,
            expense_amount: 1,
            expense_title: 'test',
            expense_description: 'test',
            date_created: 'test',
            date_modified: 'test',
        }], undefined, '1', [{ unique_id: 'wo4if43' }], []);

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        await deleteExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });

    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Expense deleted successfully');

        const { deleteExpenseReturnObject } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await deleteExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense deleted successfully');
    });

    it('should return a 404 when the cron job is not found', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.expense_id === 1), undefined, [], []);

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await deleteExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });
});
