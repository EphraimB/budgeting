import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { type Request } from 'express';
import { mockModule } from '../__mocks__/mockModule';

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

const expensesResponse = [
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

describe('GET /api/expenses', () => {
    it('should respond with an array of expenses', async () => {
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
        expect(mockResponse.json).toHaveBeenCalledWith(expensesResponse);
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
        mockModule(
            [expenses.filter((expense) => expense.expense_id === 1)],
            [],
            [],
            [],
        );

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expensesResponse.filter((expense) => expense.id === 1),
        );
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

        mockModule(
            [expenses.filter((expense) => expense.expense_id === 1)],
            [],
            [],
            [],
        );

        const { getExpenses } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expensesResponse.filter((expense) => expense.id === 1),
        );
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

    it('should respond with an array of expenses with account id and id', async () => {
        // Arrange
        mockModule(
            [
                expenses
                    .filter((expense) => expense.account_id === 1)
                    .filter((exnse) => exnse.expense_id === 1),
            ],
            [],
            [],
            [],
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
            expensesResponse
                .filter((expense) => expense.account_id === 1)
                .filter((exnse) => exnse.id === 1),
        );
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting expense';
        mockModule([], [errorMessage], [], []);

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
        mockModule([[]]);

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

        mockModule(
            [
                expenses.filter((expense) => expense.expense_id === 1),
                [],
                [{ cron_job_id: 1 }],
                [],
            ],
            [],
            [[]],
            [],
        );

        const { createExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = expenses[0];

        await createExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.expense_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating expense';
        mockModule([], [errorMessage]);

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
        mockModule([], [errorMessage]);

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
        const expensesResponse = [
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
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([expenses.filter((expense) => expense.expense_id === 1)]);

        const { createExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = expenses[0];

        // Call the function with the mock request and response
        await createExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expensesResponse.filter((expenses) => expenses.id === 1),
        );
    });
});

describe('PUT /api/expenses/:id', () => {
    it('should call next in the middleware', async () => {
        // Arrange
        mockModule(
            [expenses.filter((expense) => expense.expense_id === 1), '1'],
            [],
            [],
            [],
        );

        const { updateExpense } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses[0];

        await updateExpense(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.expense_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating expense';
        mockModule([], [errorMessage]);

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
        mockModule([], [errorMessage]);

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

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([[]]);

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
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });

    it('should respond with an array of expenses', async () => {
        // Arrange
        const expensesResponse = [
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
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([expenses.filter((expense) => expense.expense_id === 1)]);

        const { updateExpenseReturnObject } = await import(
            '../../controllers/expensesController.js'
        );

        mockRequest.body = expenses.filter(
            (expense) => expense.expense_id === 1,
        );

        // Call the function with the mock request and response
        await updateExpenseReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expensesResponse.filter((expense) => expense.id === 1),
        );
    });
});

describe('DELETE /api/expenses/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule(
            [
                expenses.filter((expense) => expense.expense_id === 1),
                [],
                [{ cron_job_id: 1, unique_id: 'income-1' }],
                [],
            ],
            [],
            [[]],
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
        mockModule([], [errorMessage]);

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

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([[]]);

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
        mockModule(['Expense deleted successfully']);

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
});
