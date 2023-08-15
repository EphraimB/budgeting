import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { accounts, expenses } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';
import { parseIntOrFallback } from '../../utils/helperFunctions.js';

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

jest.mock('../../crontab/scheduleCronJob.js', () => {
    return jest.fn().mockImplementation(
        async () =>
            await Promise.resolve({
                cronDate: '0 0 16 * *',
                uniqueId: '123',
            }),
    );
});

jest.mock('../../crontab/deleteCronJob.js', () => {
    return jest
        .fn()
        .mockImplementation(async () => await Promise.resolve('123'));
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;

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
    executeQueryValueFourth?: QueryResultRow[] | string | null,
) => {
    const executeQuery = jest.fn();

    if (errorMessage !== null && errorMessage !== undefined) {
        executeQuery.mockImplementationOnce(
            async () => await Promise.reject(new Error(errorMessage)),
        );
    } else {
        executeQuery.mockImplementationOnce(
            async () => await Promise.resolve(executeQueryValueFirst),
        );
        if (executeQueryValueSecond !== undefined) {
            executeQuery.mockImplementationOnce(
                async () => await Promise.resolve(executeQueryValueSecond),
            );

            if (executeQueryValueThird !== undefined) {
                executeQuery.mockImplementationOnce(
                    async () => await Promise.resolve(executeQueryValueThird),
                );

                if (executeQueryValueFourth !== undefined) {
                    executeQuery.mockImplementationOnce(
                        async () =>
                            await Promise.resolve(executeQueryValueFourth),
                    );
                }
            }
        }
    }

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
    }));
};

describe('GET /api/expenses', () => {
    it('should respond with an array of expenses', async () => {
        // Arrange
        mockModule(expenses);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

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

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting expenses',
        });
    });

    it('should respond with an array of expenses with id', async () => {
        // Arrange
        mockModule(expenses.filter((expense) => expense.expense_id === 1));

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses.filter((expense) => expense.expense_id === 1),
        );
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting expense',
        });
    });

    it('should respond with an array of expenses with account id', async () => {
        // Arrange
        mockModule(expenses.filter((expense) => expense.account_id === 1));

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses.filter((expense) => expense.account_id === 1),
        );
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting expenses for given account_id',
        });
    });

    it('should respond with an array of expenses with account id and id', async () => {
        // Arrange
        mockModule(
            expenses.filter(
                (expense) =>
                    expense.account_id === 1 && expense.expense_id === 1,
            ),
        );

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses.filter(
                (expense) =>
                    expense.account_id === 1 && expense.expense_id === 1,
            ),
        );
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting expense',
        });
    });

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

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
        const newExpense = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        mockModule(newExpense, undefined, [{ cron_job_id: 1 }], []);

        const { createExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = {
            account_id: expenses[0].account_id,
            tax_id: expenses[0].tax_id,
            amount: expenses[0].expense_amount,
            title: expenses[0].expense_title,
            description: expenses[0].expense_description,
            frequency_type: expenses[0].frequency_type,
            frequency_type_variable: expenses[0].frequency_type_variable,
            frequency_day_of_month: expenses[0].frequency_day_of_month,
            frequency_day_of_week: expenses[0].frequency_day_of_week,
            frequency_week_of_month: expenses[0].frequency_week_of_month,
            frequency_month_of_year: expenses[0].frequency_month_of_year,
            subsidized: expenses[0].expense_subsidized,
            begin_date: expenses[0].expense_begin_date,
        };

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

        const { createExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Act
        await createExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating expense',
        });
    });

    it('should handle errors correctly in return object', async () => {
        // Arrange
        const errorMessage = 'Error creating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Act
        await createExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting expense',
        });
    });

    it('should respond with an array of expenses', async () => {
        // Arrange
        const newExpense = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        mockModule(newExpense);

        const { createExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

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
        const updatedExpense = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        mockModule(updatedExpense, undefined, '1', []);

        const { updateExpense } = await import(
            '../../controllers/expensesController.js'
        );

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

        const { updateExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Act
        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating expense',
        });
    });

    it('should handle errors correctly in the return object function', async () => {
        // Arrange
        const errorMessage = 'Error updating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Act
        await updateExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating expense',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(
            (account) => account.account_id === 1,
        );

        // Act
        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });

    it('should return a 404 when the cron job is not found', async () => {
        // Arrange
        mockModule(
            expenses.filter((expense) => expense.expense_id === 1),
            undefined,
            [],
        );

        const { updateExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Act
        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });

    it('should respond with an array of expenses', async () => {
        // Arrange
        const newExpense = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        mockModule(newExpense);

        const { updateExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

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
        mockModule(
            [
                {
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
                },
            ],
            undefined,
            '1',
            [{ unique_id: 'wo4if43' }],
            [],
        );

        const { deleteExpense } = await import(
            '../../controllers/expensesController.js'
        );

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

        const { deleteExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting expense',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteExpense } = await import(
            '../../controllers/expensesController.js'
        );

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

        const { deleteExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await deleteExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Expense deleted successfully',
        );
    });

    it('should return a 404 when the cron job is not found', async () => {
        // Arrange
        mockModule(
            expenses.filter((expense) => expense.expense_id === 1),
            undefined,
            [],
            [],
        );

        const { deleteExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Act
        await deleteExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });
});
