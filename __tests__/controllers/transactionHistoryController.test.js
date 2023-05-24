import { jest } from '@jest/globals';
import request from 'supertest';
import { transactions } from '../../models/mockData.js'; // Import the mock data

const newTransaction = {
    amount: 100,
    account_id: 1,
    title: 'test',
    description: 'test',
};

beforeAll(() => {
    // Mock the breeManager module
    jest.unstable_mockModule('../../breeManager.js', () => ({
        initializeBree: jest.fn(),
        getBree: jest.fn(),
    }));

    // Mock the getJobs module
    jest.unstable_mockModule('../../getJobs.js', () => ({
        default: jest.fn(),
    }));

    jest.unstable_mockModule('../../controllers/transactionHistoryController.js', () => ({
        getTransactions: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the transactions array
                const transaction = transactions.filter(transaction => transaction.transaction_id === id);

                // Respond with the filtered array
                response.status(200).json(transaction);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(transactions);
            }
        }),
        createTransaction: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newTransaction);
        }),
        updateTransaction: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newTransaction);
        }),
        deleteTransaction: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Transaction successfully deleted');
        }),
    }));

});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/transactionHistory', () => {
    it('should respond with an array of transactions', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default).get('/api/transactionHistory');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(transactions);
    });
});

describe('GET /api/transactionHistory with id query', () => {
    it('should respond with an array of transactions', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default).get(`/api/transactionHistory?id=${id}`);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(transactions.filter(transaction => transaction.transaction_id === id));
    });
});

describe('POST /api/transactionHistory', () => {
    it('should respond with the new transactions', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .post('/api/transactionHistory')
            .send(newTransaction);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newTransaction);
    });
});

describe('PUT /api/transactionHistory/:id', () => {
    it('should respond with the updated transaction', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .put('/api/transactionHistory/1')
            .send(newTransaction);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newTransaction);
    });
});

describe('DELETE /api/transactionHistory/:id', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/transactionHistory/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Transaction successfully deleted');
    });
});