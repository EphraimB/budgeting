import { jest } from '@jest/globals';
import { transactions } from '../../models/mockData.js';

jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue(transactions.filter(transaction => transaction.transaction_id === 1)),
    handleError: jest.fn().mockReturnValue({ message: 'Error' }),
}));

const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = await import('../../controllers/transactionHistoryController.js');

let mockRequest = {};
let mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),  // Mock send method
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/transactionHistory', () => {
    it('should respond with an array of transactions', async () => {
        mockRequest = {
            query: {
                id: 1
            }
        }; // Set the mockRequest.query

        // Call the function with the mock request and response
        await getTransactions(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transactions.filter(transaction => transaction.transaction_id === 1));
    });
});

describe('POST /api/transactionHistory', () => {
    it('should respond with the new transaction', async () => {
        const newTransaction = transactions.filter(transaction => transaction.transaction_id === 1);
        mockRequest = { body: newTransaction };

        await createTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTransaction);
    });
});

describe('PUT /api/transactionHistory/:id', () => {
    it('should respond with the updated transaction', async () => {
        const updatedTransaction = transactions.filter(transaction => transaction.transaction_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedTransaction };

        await updateTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedTransaction);
    });
});

describe('DELETE /api/transactionHistory/:id', () => {
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 } };

        await deleteTransaction(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted transaction');
    });
});
