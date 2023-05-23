import { jest } from '@jest/globals';
import request from 'supertest';
import { accounts } from '../models/mockData.js'; // Import the mock data

beforeAll(() => {
    // Mock the breeManager module
    jest.unstable_mockModule('../breeManager.js', () => ({
        initializeBree: jest.fn(),
        getBree: jest.fn(),
    }));

    // Mock the getJobs module
    jest.unstable_mockModule('../getJobs.js', () => ({
        default: jest.fn(),
    }));

    // Mock the getAccounts route function
    jest.unstable_mockModule('../controllers/accountsController.js', () => ({
        getAccounts: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the accounts array
                const account = accounts.filter(account => account.account_id === id);

                // Respond with the filtered array
                response.status(200).json(account);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(accounts);
            }
        }),
        createAccount: jest.fn().mockImplementation((request, response) => {
            const newAccount = {
                name: 'test',
                balance: 100,
                type: 1
            };

            // Respond with the new account
            response.status(200).json(newAccount);
        }),
        updateAccount: jest.fn().mockImplementation((request, response) => {
            const newAccount = {
                name: 'test',
                balance: 100,
                type: 1
            };

            // Respond with the new account
            response.status(200).json(newAccount);
        }),
        deleteAccount: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Account successfully deleted');
        }),
    }));

});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        // Act
        const app = await import('../app.js');
        const response = await request(app.default).get('/api/accounts');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(accounts);
    });
});

describe('GET /api/accounts with id query', () => {
    it('should respond with an array of accounts', async () => {
        const id = 1;

        // Act
        const app = await import('../app.js');
        const response = await request(app.default).get(`/api/accounts?id=${id}`);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(accounts.filter(account => account.account_id === id));
    });
});

describe('POST /api/accounts', () => {
    it('should respond with the new account', async () => {
        // Act
        const app = await import('../app.js');
        const newAccount = {
            name: 'test',
            balance: 100,
            type: 1
        };
        const response = await request(app.default)
            .post('/api/accounts')
            .send(newAccount);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newAccount);
    });
});

describe('PUT /api/accounts/:id', () => {
    it('should respond with the updated account', async () => {
        // Act
        const app = await import('../app.js');
        const newAccount = {
            name: 'test',
            balance: 100,
            type: 1
        };
        const response = await request(app.default)
            .put('/api/accounts/1')
            .send(newAccount);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newAccount);
    });
});

describe('DELETE /api/accounts/:id', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../app.js');
        const response = await request(app.default)
            .delete('/api/accounts/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Account successfully deleted');
    });
});