import { jest } from '@jest/globals';
import { accounts, expenses } from '../../models/mockData.js';

jest.unstable_mockModule('../../bree/jobs/scheduleCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job scheduled' })
}));

jest.unstable_mockModule('../../bree/jobs/deleteCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job deleted' })
}));

// Mock request and response
let mockRequest;
let mockResponse;

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

// Helper function to generate mock module
const mockModule = (executeQueryValue, errorMessage) => {
    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: errorMessage
            ? jest.fn().mockRejectedValue(new Error(errorMessage))
            : jest.fn().mockResolvedValue(executeQueryValue),
        handleError: jest.fn((res, message) => {
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
        await getExpenses(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule(null, 'Error getting expenses');

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: null };

        // Act
        await getExpenses(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expenses' });
    });

    it('should respond with an array of expenses with id', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.expense_id === 1));

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getExpenses(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses.filter(expense => expense.expense_id === 1));
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        mockModule(null, 'Error getting expenses');

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: null };

        // Act
        await getExpenses(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expenses' });
    });
});

describe('POST /api/expenses', () => {
    it('should respond with the new expense', async () => {
        // Arrange
        const newExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(expenses.filter(expense => expense.expense_id === 1));

        const { createExpense } = await import('../../controllers/expensesController.js');

        mockRequest.body = newExpense;

        await createExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule(null, 'Error creating expense');

        const { createExpense } = await import('../../controllers/expensesController.js');

        mockRequest.body = accounts.filter(account => account.account_id === 1);

        // Act
        await createExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating expense' });
    });
});

describe('PUT /api/expenses/:id', () => {
    it('should respond with the updated expense', async () => {
        const updatedExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(expenses.filter(expense => expense.expense_id === 1));

        const { updateExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedExpense;

        await updateExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedExpense);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule(null, 'Error updating expense');

        const { updateExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = expenses.filter(expense => expense.expense_id === 1);

        // Act
        await updateExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating expense' });
    });
});

describe('DELETE /api/expenses/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule(expenses.filter(expense => expense.expense_id === 1));

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        await deleteExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense deleted successfully');
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule(null, 'Error deleting expense');

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting expense' });
    });
});
