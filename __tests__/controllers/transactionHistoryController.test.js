import { jest } from '@jest/globals';
import { transactions } from '../../models/mockData.js';

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
        send: jest.fn()
    };
});

afterEach(() => {
    jest.resetModules();
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
        })
    }));
};

describe('GET /api/transactionHistory', () => {
    it('should respond with an array of transactions', async () => {
        // Arrange
        mockModule(transactions);

        mockRequest.query = { id: null };

        const { getTransactions } = await import('../../controllers/transactionHistoryController.js');

        // Call the function with the mock request and response
        await getTransactions(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transactions);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting transaction history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: null };

        const { getTransactions } = await import('../../controllers/transactionHistoryController.js');

        // Call the function with the mock request and response
        await getTransactions(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transaction history' });

        // Assert that the error was logged in the console
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of transactions with id', async () => {
        // Arrange
        mockModule(transactions.filter(transaction => transaction.transaction_id === 1));

        mockRequest.query = { id: 1 };

        const { getTransactions } = await import('../../controllers/transactionHistoryController.js');

        // Call the function with the mock request and response
        await getTransactions(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transactions.filter(transaction => transaction.transaction_id === 1));
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting transaction history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getTransactions } = await import('../../controllers/transactionHistoryController.js');

        // Call the function with the mock request and response
        await getTransactions(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transaction history' });

        // Assert that the error was logged in the console
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getTransactions } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getTransactions(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
    });
});

describe('POST /api/transactionHistory', () => {
    it('should respond with the new transaction', async () => {
        // Arrange
        const newTransaction = transactions.filter(transaction => transaction.transaction_id === 1);

        mockModule(newTransaction);

        const { createTransaction } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.body = newTransaction;

        await createTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTransaction);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating transaction history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createTransaction } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.body = transactions.filter(transaction => transaction.transaction_id === 1);

        await createTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating transaction history' });

        // Assert that the error was logged in the console
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/transactionHistory/:id', () => {
    it('should respond with the updated transaction', async () => {
        // Arrange
        const updatedTransaction = transactions.filter(transaction => transaction.transaction_id === 1);

        mockModule(updatedTransaction);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTransaction;

        const { updateTransaction } = await import('../../controllers/transactionHistoryController.js');

        await updateTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedTransaction);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating transaction history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.body = transactions.filter(transaction => transaction.transaction_id === 1);

        const { updateTransaction } = await import('../../controllers/transactionHistoryController.js');

        await updateTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating transaction history' });

        // Assert that the error was logged in the console
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateTransaction } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = transactions.filter(transaction => transaction.transaction_id === 1);

        // Act
        await updateTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
    });
});

describe('DELETE /api/transactionHistory/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted transaction');

        const { deleteTransaction } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.params = { id: 1 };

        await deleteTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted transaction history');
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error deleting transaction history';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteTransaction } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.params = { id: 1 };

        await deleteTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting transaction history' });

        // Assert that the error was logged in the console
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteTransaction } = await import('../../controllers/transactionHistoryController.js');

        mockRequest.params = { id: 8 };

        // Act
        await deleteTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
    });
});
