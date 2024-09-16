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

const generatedTransactionsResponse = [
    {
        accountId: 1,
        currentBalance: 250,
        transactions: [
            {
                id: 'bf83vb3b',
                title: 'Testing deposits',
                description: 'Just testing deposits',
                amount: 250,
                taxRate: 0,
                totalAmount: 250,
                date: '2021-03-01T16:30',
                balance: 500,
            },
            {
                id: 'bv83vb293o',
                title: 'Testing withdrawals',
                description: 'Just testing withdrawals',
                amount: -100,
                taxRate: 0,
                totalAmount: -100,
                date: '2021-03-02T12:30',
                balance: 400,
            },
        ],
    },
    {
        accountId: 2,
        currentBalance: 0,
        transactions: [{}],
    },
];

describe('GET /api/transactions', () => {
    it('should respond with an array of generated transactions', async () => {
        // Arrange
        mockModule(
            [generatedTransactionsResponse],
            generatedTransactionsResponse,
        );

        const { getTransactions } = await import(
            '../../src/controllers/transactionsController.js'
        );

        mockRequest.query = { fromDate: '2021-02-25', toDate: '2022-02-25' };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            generatedTransactionsResponse,
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { getTransactions } = await import(
            '../../src/controllers/transactionHistoryController.js'
        );

        mockRequest.query = { fromDate: '2021-02-25', toDate: '2022-02-25' };

        // Call the function with the mock request and response
        await getTransactions(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting generated transactions',
                });
            },
        );
    });
});

describe('GET /api/transactions/:accountId', () => {
    it('should respond with an array of generated transactions with account id', async () => {
        // Arrange
        mockModule(
            [
                generatedTransactionsResponse.filter(
                    (generatedTransaction) =>
                        generatedTransaction.accountId === 1,
                ),
            ],
            generatedTransactionsResponse.filter(
                (generatedTransaction) => generatedTransaction.accountId === 1,
            ),
        );

        const { getTransactionsByAccountId } = await import(
            '../../src/controllers/transactionsController.js'
        );

        mockRequest.params = { accountId: 1 };
        mockRequest.query = { fromDate: '2021-02-25', toDate: '2022-02-25' };

        // Call the function with the mock request and response
        await getTransactionsByAccountId(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            generatedTransactionsResponse.filter(
                (generatedTransaction) => generatedTransaction.accountId === 1,
            ),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        const { getTransactionsByAccountId } = await import(
            '../../src/controllers/transactionsController.js'
        );

        mockRequest.params = { accountId: 1 };
        mockRequest.query = { fromDate: '2021-02-25', toDate: '2022-02-25' };

        // Call the function with the mock request and response
        await getTransactionsByAccountId(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message:
                    'Error getting generated transactions for account id of 1',
            });
        });
    });
});
