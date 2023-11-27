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
 * @param executeQueryResponses - Array of responses for executeQuery
 * @param handleErrorResponses - Array of responses for handleError
 * @param scheduleQueryResponses - Array of responses for scheduleQuery
 * @param unscheduleQueryResponses - Array of responses for unscheduleQuery
 * Mock module with mock implementations for executeQuery, handleError, scheduleQuery, and unscheduleQuery
 */
const mockModule = (
    executeQueryResponses: any = [], // Array of responses for executeQuery
    handleErrorResponses: any = [], // Array of responses for handleError
    scheduleQueryResponses: any = [], // Array of responses for scheduleQuery
    unscheduleQueryResponses: any = [], // Array of responses for unscheduleQuery
) => {
    const executeQuery = jest.fn();
    const handleError = jest.fn();
    const scheduleQuery = jest.fn();
    const unscheduleQuery = jest.fn();

    // Set up mock implementations for executeQuery
    executeQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            executeQuery.mockImplementationOnce(() => Promise.reject(response));
        } else {
            executeQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for handleError
    handleErrorResponses.forEach((response: any) => {
        handleError.mockImplementationOnce((res: any, message: any) => {
            res.status(response.status || 400).json({
                message: response.message || message,
            });
        });
    });

    // Set up mock implementations for scheduleQuery
    scheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for unscheduleQuery
    unscheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError,
        scheduleQuery,
        unscheduleQuery,
        parseIntOrFallback,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));
};

describe('GET /api/expenses', () => {
    it('should respond with an array of expenses', async () => {
        const expenses = [
            {
                expense_id: 1,
                account_id: 1,
                tax_id: 1,
                expense_amount: 50,
                expense_title: 'Test Expense',
                expense_description: 'Test Expense to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                expense_subsidized: 0,
                expense_begin_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
            {
                expense_id: 2,
                account_id: 1,
                tax_id: 1,
                expense_amount: 50,
                expense_title: 'Test Expense 2',
                expense_description: 'Test Expense 2 to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                expense_subsidized: 0,
                expense_begin_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        const expectedResponse = [
            {
                id: 1,
                account_id: 1,
                tax_id: 1,
                amount: 50,
                title: 'Test Expense',
                description: 'Test Expense to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                subsidized: 0,
                begin_date: '2020-01-01',
                next_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
            {
                id: 2,
                account_id: 1,
                tax_id: 1,
                amount: 50,
                title: 'Test Expense 2',
                description: 'Test Expense 2 to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                subsidized: 0,
                begin_date: '2020-01-01',
                next_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        // Arrange
        mockModule([expenses], [], [], []);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting expenses';
        mockModule([], [errorMessage], [], []);

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
        const expenses = [
            {
                expense_id: 1,
                account_id: 1,
                tax_id: 1,
                expense_amount: 50,
                expense_title: 'Test Expense',
                expense_description: 'Test Expense to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                expense_subsidized: 0,
                expense_begin_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        const expectedResponse = [
            {
                id: 1,
                account_id: 1,
                tax_id: 1,
                amount: 50,
                title: 'Test Expense',
                description: 'Test Expense to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                subsidized: 0,
                begin_date: '2020-01-01',
                next_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        // Arrange
        mockModule([expenses], [], [], []);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        mockModule([], [errorMessage], [], []);

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
        const expenses = [
            {
                expense_id: 1,
                account_id: 1,
                tax_id: 1,
                expense_amount: 50,
                expense_title: 'Test Expense',
                expense_description: 'Test Expense to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                expense_subsidized: 0,
                expense_begin_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        const expectedResponse = [
            {
                id: 1,
                account_id: 1,
                tax_id: 1,
                amount: 50,
                title: 'Test Expense',
                description: 'Test Expense to test the expense route',
                frequency_type: 2,
                frequency_type_variable: null,
                frequency_day_of_month: null,
                frequency_day_of_week: null,
                frequency_week_of_month: null,
                frequency_month_of_year: null,
                subsidized: 0,
                begin_date: '2020-01-01',
                next_date: '2020-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([expenses], [], [], []);

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        mockModule([], [errorMessage], [], []);

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
});

//     it('should respond with an array of expenses with account id and id', async () => {
//         // Arrange
//         mockModule(
//             expenses.filter(
//                 (expense) => expense.account_id === 1 && expense.id === 1,
//             ),
//         );

//         const { getExpenses } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.query = { account_id: 1, id: 1 };

//         // Call the function with the mock request and response
//         await getExpenses(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(
//             expenses.filter(
//                 (expense) => expense.account_id === 1 && expense.id === 1,
//             ),
//         );
//     });

//     it('should handle errors correctly with account id and id', async () => {
//         // Arrange
//         const errorMessage = 'Error getting expense';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { getExpenses } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.query = { account_id: 1, id: 1 };

//         // Act
//         await getExpenses(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting expense',
//         });
//     });

//     it('should respond with a 404 error message when the expense does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { getExpenses } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.query = { id: 3 };

//         // Act
//         await getExpenses(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
//     });
// });

// describe('POST /api/expenses', () => {
//     it('should populate the request.expense_id', async () => {
//         // Arrange
//         const newExpense = expenses.filter((expense) => expense.id === 1);

//         mockModule(newExpense, undefined, [{ cron_job_id: 1 }], []);

//         const { createExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.body = {
//             account_id: expenses[0].account_id,
//             tax_id: expenses[0].tax_id,
//             amount: expenses[0].amount,
//             title: expenses[0].title,
//             description: expenses[0].description,
//             frequency_type: expenses[0].frequency_type,
//             frequency_type_variable: expenses[0].frequency_type_variable,
//             frequency_day_of_month: expenses[0].frequency_day_of_month,
//             frequency_day_of_week: expenses[0].frequency_day_of_week,
//             frequency_week_of_month: expenses[0].frequency_week_of_month,
//             frequency_month_of_year: expenses[0].frequency_month_of_year,
//             subsidized: expenses[0].subsidized,
//             begin_date: expenses[0].begin_date,
//         };

//         await createExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockRequest.expense_id).toBe(1);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error creating expense';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { createExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.body = expenses.filter((expense) => expense.id === 1);

//         // Act
//         await createExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error creating expense',
//         });
//     });

//     it('should handle errors correctly in return object', async () => {
//         // Arrange
//         const errorMessage = 'Error creating expense';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { createExpenseReturnObject } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.body = expenses.filter((expense) => expense.id === 1);

//         // Act
//         await createExpenseReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting expense',
//         });
//     });

//     it('should respond with an array of expenses', async () => {
//         // Arrange
//         const newExpense = expenses.filter((expense) => expense.id === 1);

//         mockModule(newExpense);

//         const { createExpenseReturnObject } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.body = newExpense;

//         // Call the function with the mock request and response
//         await createExpenseReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(201);
//         expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
//     });
// });

// describe('PUT /api/expenses/:id', () => {
//     it('should call next in the middleware', async () => {
//         const updatedExpense = expenses.filter((expense) => expense.id === 1);

//         mockModule(updatedExpense, undefined, '1', []);

//         const { updateExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedExpense;

//         await updateExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockRequest.expense_id).toBe(1);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error updating expense';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { updateExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = expenses.filter((expense) => expense.id === 1);

//         // Act
//         await updateExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating expense',
//         });
//     });

//     it('should handle errors correctly in the return object function', async () => {
//         // Arrange
//         const errorMessage = 'Error updating expense';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { updateExpenseReturnObject } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.body = expenses.filter((expense) => expense.id === 1);

//         // Act
//         await updateExpenseReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating expense',
//         });
//     });

//     it('should respond with a 404 error message when the account does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { updateExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = accounts.filter(
//             (account) => account.account_id === 1,
//         );

//         // Act
//         await updateExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
//     });

//     it('should respond with an array of expenses', async () => {
//         // Arrange
//         const newExpense = expenses.filter((expense) => expense.id === 1);

//         mockModule(newExpense);

//         const { updateExpenseReturnObject } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.body = newExpense;

//         // Call the function with the mock request and response
//         await updateExpenseReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
//     });
// });

// describe('DELETE /api/expenses/:id', () => {
//     it('should call next on the middleware', async () => {
//         // Arrange
//         mockModule(
//             [
//                 {
//                     expense_id: 1,
//                     account_id: 1,
//                     cron_job_id: 1,
//                     tax_id: 1,
//                     tax_rate: 1,
//                     expense_amount: 1,
//                     expense_title: 'test',
//                     expense_description: 'test',
//                     date_created: 'test',
//                     date_modified: 'test',
//                 },
//             ],
//             undefined,
//             '1',
//             [{ unique_id: 'wo4if43' }],
//             [],
//         );

//         const { deleteExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting expense';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { deleteExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting expense',
//         });
//     });

//     it('should respond with a 404 error message when the account does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deleteExpense } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteExpense(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
//     });

//     it('should respond with a success message', async () => {
//         // Arrange
//         mockModule('Expense deleted successfully');

//         const { deleteExpenseReturnObject } = await import(
//             '../../controllers/expensesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Call the function with the mock request and response
//         await deleteExpenseReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Expense deleted successfully',
//         );
//     });
// });
