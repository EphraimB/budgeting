import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';
import { TransactionHistory } from '../../src/types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const transactions = [
    {
        id: 1,
        accountId: 1,
        amount: 1000,
        taxRate: 0,
        title: 'Test Deposit',
        description: 'Test Deposit',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        accountId: 1,
        amount: 2000,
        taxRate: 0,
        title: 'Test Deposit 2',
        description: 'Test Deposit 2',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 3,
        accountId: 1,
        amount: 1000,
        taxRate: 0,
        title: 'Test Withdrawal',
        description: 'Test Withdrawal',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 4,
        accountId: 1,
        amount: 200,
        taxRate: 0,
        title: 'Test Withdrawal 2',
        description: 'Test Withdrawal 2',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/transactions/history', () => {
    it('should respond with an array of transactions', async () => {
        // Arrange
        mockModule([transactions], transactions);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transactions);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting transaction history',
                });
            },
        );
    });

    it('should respond with an array of transactions with account id', async () => {
        // Arrange
        mockModule([
            transactions.filter((transaction) => transaction.accountId === 1),
        ]);

        mockRequest.query = { accountId: 1 };

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactions.filter((transaction) => transaction.accountId === 1),
        );
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { accountId: 1 };

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting transaction history',
                });
            },
        );
    });
});

describe('GET /api/transactions/history/:id', () => {
    it('should respond with an array of transactions with id', async () => {
        // Arrange
        mockModule([
            transactions.filter((transaction) => transaction.id === 1),
        ]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactions.filter((transaction) => transaction.id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting transaction history',
                });
            },
        );
    });

    it('should respond with an array of transactions with account id and id', async () => {
        // Arrange
        mockModule([
            transactions.filter(
                (transaction) =>
                    transaction.accountId === 1 && transaction.id === 1,
            ),
        ]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactions.filter(
                (transaction) =>
                    transaction.accountId === 1 && transaction.id === 1,
            ),
        );
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        mockModule([]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting transaction history',
                });
            },
        );
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
    });
});

describe('POST /api/transactionHistory', () => {
    it('should respond with the new transaction', async () => {
        // Arrange
        const newTransaction = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        mockModule([newTransaction]);

        const { createTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.body = newTransaction;

        await createTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactionsResponse.filter((transaction) => transaction.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { createTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.body = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        await createTransaction(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error creating transaction history',
                });
            },
        );
    });
});

describe('PUT /api/transactionHistory/:id', () => {
    it('should respond with the updated transaction', async () => {
        // Arrange
        const updatedTransaction = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        mockModule([updatedTransaction]);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTransaction;

        const { updateTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        await updateTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactionsResponse.filter((transaction) => transaction.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        const { updateTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        await updateTransaction(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error updating transaction history',
                });
            },
        );
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        // Act
        await updateTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
    });
});

describe('DELETE /api/transactionHistory/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule(['Successfully deleted transaction']);

        const { deleteTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted transaction history',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { deleteTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteTransaction(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting transaction history',
                });
            },
        );
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteTransaction } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 8 };

        // Act
        await deleteTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
    });
});
