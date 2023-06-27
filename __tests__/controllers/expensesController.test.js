import { jest } from '@jest/globals';
import { accounts, expenses } from '../../models/mockData.js';

jest.unstable_mockModule('../../bree/jobs/scheduleCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ cronDate: '0 0 16 * *', uniqueId: '123' })
}));

jest.unstable_mockModule('../../bree/jobs/deleteCronJob.js', () => ({
    default: jest.fn().mockReturnValue('123')
}));

// Mock request and response
let mockRequest;
let mockResponse;
let consoleSpy;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
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
        const errorMessage = 'Error getting expenses';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpenses } = await import('../../controllers/expensesController.js');

        mockRequest.query = { id: null };

        // Act
        await getExpenses(mockRequest, mockResponse);

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
        await getExpenses(mockRequest, mockResponse);

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
        await getExpenses(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('POST /api/expenses', () => {
    it('should respond with the new expense', async () => {
        // Arrange
        const newExpense = expenses.filter(expense => expense.expense_id === 1);

        mockModule(newExpense);

        const { createExpense } = await import('../../controllers/expensesController.js');

        mockRequest.body = newExpense;

        await createExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createExpense } = await import('../../controllers/expensesController.js');

        mockRequest.body = accounts.filter(account => account.account_id === 1);

        // Act
        await createExpense(mockRequest, mockResponse);

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

        await updateExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedExpense);
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
        await updateExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('DELETE /api/expenses/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Expense deleted successfully');

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        await deleteExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense deleted successfully');
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting expense';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteExpense } = await import('../../controllers/expensesController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting expense' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});
