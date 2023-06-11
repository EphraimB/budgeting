import { jest } from '@jest/globals';
import { expenses } from '../../models/mockData.js';

jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue(expenses.filter(expense => expense.expense_id === 1)),
    handleError: jest.fn().mockReturnValue({ message: 'Error' }),
}));

jest.unstable_mockModule('../../jobs/scheduleCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job scheduled' })
}));

jest.unstable_mockModule('../../jobs/deleteCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job deleted' })
}));

const { getExpenses, createExpense, updateExpense, deleteExpense } = await import('../../controllers/expensesController.js');

let mockRequest = {};
let mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),  // Mock send method
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/expenses', () => {
    it('should respond with an array of expenses', async () => {
        mockRequest = {
            query: {
                id: 1
            }
        }; // Set the mockRequest.query

        // Call the function with the mock request and response
        await getExpenses(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expenses.filter(expense => expense.expense_id === 1));
    });
});

describe('POST /api/expenses', () => {
    it('should respond with the new expense', async () => {
        const newExpense = expenses.filter(expense => expense.expense_id === 1);
        mockRequest = { body: newExpense };

        await createExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newExpense);
    });
});

describe('PUT /api/expenses/:id', () => {
    it('should respond with the updated expense', async () => {
        const updatedExpense = expenses.filter(expense => expense.expense_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedExpense };

        await updateExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedExpense);
    });
});

describe('DELETE /api/expenses/:id', () => {
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 } };

        await deleteExpense(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Expense deleted successfully');
    });
});
