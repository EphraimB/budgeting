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

        mockModule(newExpense);

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
});

describe('PUT /api/expenses/:id', () => {
    it('should respond with the updated expense', async () => {
        const updatedExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(updatedExpense);

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
});

describe('DELETE /api/expenses/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Expense deleted successfully');

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
});
