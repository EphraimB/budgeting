import { jest } from '@jest/globals';
import { accounts } from '../../models/mockData.js'; // Import the mock data
import { getAccounts } from '../../controllers/accountsController.js';

let req, res;

// Mock the executeQuery module
jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue([{
        account_id: 1,
        account_name: 'test',
        account_type: 1,
        account_balance: 100,
        date_created: '2021-01-01',
        date_modified: '2021-01-01',
    },
    ]),
}));

// Mock the breeManager module
jest.unstable_mockModule('../../breeManager.js', () => ({
    initializeBree: jest.fn(),
    getBree: jest.fn(),
}));

// Mock the getJobs module
jest.unstable_mockModule('../../getJobs.js', () => ({
    default: jest.fn(),
}));

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        // Call the function with the mock request and response
        await getAccounts(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(accounts);
    });
});

describe('GET /api/accounts with id query', () => {
    it('should respond with an array of accounts', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default).get(`/api/accounts?id=${id}`);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(accounts.filter(account => account.account_id === id));
    });
});

describe('POST /api/accounts', () => {
    it('should respond with the new account', async () => {
        // Act
        const app = await import('../../app.js');
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
        const app = await import('../../app.js');
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
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/accounts/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Account successfully deleted');
    });
});