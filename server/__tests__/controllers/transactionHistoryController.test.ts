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

// Mock request and response
let mockRequest: any;
let mockResponse: any;

jest.mock('../../config/winston', () => ({
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
        transaction_id: 1,
        account_id: 1,
        transaction_amount: 1000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Deposit',
        transaction_description: 'Test Deposit',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        transaction_id: 2,
        account_id: 1,
        transaction_amount: 2000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Deposit 2',
        transaction_description: 'Test Deposit 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        transaction_id: 3,
        account_id: 1,
        transaction_amount: 1000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Withdrawal',
        transaction_description: 'Test Withdrawal',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        transaction_id: 4,
        account_id: 1,
        transaction_amount: 200,
        transaction_tax_rate: 0,
        transaction_title: 'Test Withdrawal 2',
        transaction_description: 'Test Withdrawal 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const transactionsResponse = [
    {
        id: 1,
        account_id: 1,
        transaction_amount: 1000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Deposit',
        transaction_description: 'Test Deposit',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        account_id: 1,
        transaction_amount: 2000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Deposit 2',
        transaction_description: 'Test Deposit 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 3,
        account_id: 1,
        transaction_amount: 1000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Withdrawal',
        transaction_description: 'Test Withdrawal',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 4,
        account_id: 1,
        transaction_amount: 200,
        transaction_tax_rate: 0,
        transaction_title: 'Test Withdrawal 2',
        transaction_description: 'Test Withdrawal 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

describe('GET /api/transactionHistory', () => {
    it('should respond with an array of transactions', async () => {
        // Arrange
        mockModule([transactions]);

        mockRequest.query = { id: null };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transactionsResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting transaction history';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: null };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transaction history',
        });
    });

    it('should respond with an array of transactions with id', async () => {
        // Arrange
        mockModule([
            transactions.filter(
                (transaction) => transaction.transaction_id === 1,
            ),
        ]);

        mockRequest.query = { id: 1 };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactionsResponse.filter((transaction) => transaction.id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting transaction history';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: 1 };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transaction history',
        });
    });

    it('should respond with an array of transactions with account id', async () => {
        // Arrange
        mockModule([
            transactions.filter((transaction) => transaction.account_id === 1),
        ]);

        mockRequest.query = { id: null, account_id: 1 };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactionsResponse.filter(
                (transaction) => transaction.account_id === 1,
            ),
        );
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting transaction history';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: null, account_id: 1 };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transaction history',
        });
    });

    it('should respond with an array of transactions with account id and id', async () => {
        // Arrange
        mockModule([
            transactions.filter(
                (transaction) =>
                    transaction.account_id === 1 &&
                    transaction.transaction_id === 1,
            ),
        ]);

        mockRequest.query = { id: 1, account_id: 1 };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transactionsResponse.filter(
                (transaction) =>
                    transaction.account_id === 1 && transaction.id === 1,
            ),
        );
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting transaction history';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: 1, account_id: 1 };

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transaction history',
        });
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getTransactions } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        mockRequest.query = { id: 3 };

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
            '../../controllers/transactionHistoryController.js'
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
        const errorMessage = 'Error creating transaction history';
        mockModule([], [errorMessage]);

        const { createTransaction } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        mockRequest.body = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        await createTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating transaction history',
        });
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
            '../../controllers/transactionHistoryController.js'
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
        const errorMessage = 'Error updating transaction history';
        mockModule([], [errorMessage]);

        mockRequest.params = { id: 1 };
        mockRequest.body = transactions.filter(
            (transaction) => transaction.transaction_id === 1,
        );

        const { updateTransaction } = await import(
            '../../controllers/transactionHistoryController.js'
        );

        await updateTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating transaction history',
        });
    });

    it('should respond with a 404 error message when the transaction does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateTransaction } = await import(
            '../../controllers/transactionHistoryController.js'
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
            '../../controllers/transactionHistoryController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteTransaction(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted transaction history',
        );
    });
});

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting transaction history';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { deleteTransaction } = await import(
//             '../../controllers/transactionHistoryController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteTransaction(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting transaction history',
//         });
//     });

//     it('should respond with a 404 error message when the transaction does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deleteTransaction } = await import(
//             '../../controllers/transactionHistoryController.js'
//         );

//         mockRequest.params = { id: 8 };

//         // Act
//         await deleteTransaction(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Transaction not found');
//     });
// });
