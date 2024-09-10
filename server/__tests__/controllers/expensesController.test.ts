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

jest.mock('../../src/config/winston', () => ({
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
        id: 1,
        accountId: 1,
        taxId: 1,
        amount: 50,
        title: 'Test Expense',
        description: 'Test Expense to test the expense route',
        frequencyType: 2,
        frequencyTypeVariable: 1,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        frequencyMonthOfYear: null,
        subsidized: 0,
        beginDate: '2020-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        accountId: 1,
        taxId: 1,
        amount: 50,
        title: 'Test Expense 2',
        description: 'Test Expense 2 to test the expense route',
        frequencyType: 2,
        frequencyTypeVariable: 1,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        frequencyMonthOfYear: null,
        subsidized: 0,
        beginDate: '2020-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/expenses', () => {
    it('should respond with an array of expenses', async () => {
        // Arrange
        mockModule([expenses, [], [], []], expenses);

        const { getExpenses } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getExpenses } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.query = { accountId: null };

        // Act
        await getExpenses(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting expenses',
            });
        });
    });

    it('should respond with an array of expenses with account id', async () => {
        // Arrange

        mockModule(
            [expenses.filter((expense) => expense.accountId === 1), [], [], []],
            expenses.filter((expense) => expense.accountId === 1),
        );

        const { getExpenses } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses.filter((expense) => expense.accountId === 1),
        );
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        mockModule([]);

        const { getExpenses } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Act
        await getExpenses(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting expenses for given account id',
            });
        });
    });
});

describe('GET /api/expenses/:id', () => {
    it('should respond with an array of expenses with id', async () => {
        // Arrange
        mockModule(
            [expenses.filter((expense) => expense.id === 1), [], [], []],
            expenses.filter((expense) => expense.id === 1),
        );

        const { getExpensesById } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getExpensesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    expenses.filter((expense) => expense.id === 1),
                );
            },
        );
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        mockModule([]);

        const { getExpensesById } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Act
        await getExpensesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting expense',
                });
            },
        );
    });

    it('should respond with an array of expenses with account id and id', async () => {
        // Arrange
        mockModule(
            [
                expenses
                    .filter((expense) => expense.accountId === 1)
                    .filter((exnse) => exnse.id === 1),
                [],
                [],
                [],
            ],
            expenses
                .filter((expense) => expense.accountId === 1)
                .filter((exnse) => exnse.id === 1),
        );

        const { getExpensesById } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getExpensesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses
                .filter((expense) => expense.accountId === 1)
                .filter((exnse) => exnse.id === 1)[0],
        );
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        mockModule([]);

        const { getExpensesById } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Act
        await getExpensesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting expense',
                });
            },
        );
    });

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getExpensesById } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: null };

        // Act
        await getExpensesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });
});

describe('POST /api/expenses', () => {
    it('should respond with an expense', async () => {
        // Arrange

        mockModule(
            [
                [{ tax_rate: 0 }],
                [],
                [],
                [{ id: 1, unique_id: '3f3fv3vvv' }],
                expenses.filter((expense) => expense.id === 1),
                [],
            ],
            expenses.filter((expense) => expense.id === 1),
        );

        const { createExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.body = expenses[0];

        await createExpense(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses.filter((expense) => expense.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.body = expenses.filter((expense) => expense.id === 1);

        // Act
        await createExpense(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating expense',
            });
        });
    });
});

describe('PUT /api/expenses/:id', () => {
    it('should respond with an expense', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1, cron_job_id: 1 }],
                [{ unique_id: 'dbu3ig7f' }],
                [],
                [],
                [{ tax_rate: 0 }],
                [],
                [],
                expenses.filter((expense) => expense.id === 1),
                [],
            ],
            expenses.filter((expense) => expense.id === 1),
        );

        const { updateExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter((expense) => expense.id === 1);

        await updateExpense(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expenses.filter((expense) => expense.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter((expense) => expense.id === 1);

        // Act
        await updateExpense(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating expense',
            });
        });
    });

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter((expense) => expense.id === 1);

        // Act
        await updateExpense(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });
});

describe('DELETE /api/expenses/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([
            [{ id: 1, cron_job_id: 1 }],
            [],
            [],
            [{ id: 1, unique_id: 'c3f2v2v3r' }],
            [],
            [],
            [],
        ]);

        const { deleteExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteExpense(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Expense deleted successfully',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting expense',
            });
        });
    });

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteExpense } = await import(
            '../../src/controllers/expensesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense not found');
    });
});
