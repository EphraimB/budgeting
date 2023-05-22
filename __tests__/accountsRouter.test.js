import { jest } from '@jest/globals';
import request from 'supertest';
import { accounts } from '../models/mockData.js'; // Import the mock data


describe('GET /api/accounts', () => {
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

        // Mock the accountsController module
        jest.unstable_mockModule('../controllers/accountsController.js', () => ({
            getAccounts: jest.fn().mockResolvedValue(accounts),
            createAccount: jest.fn(),
            updateAccount: jest.fn(),
            deleteAccount: jest.fn(),
        }));
    });

    afterAll(() => {
        // Restore the original console.log function
        jest.restoreAllMocks();
    });

    it('should respond with an array of accounts', async () => {
        // Arrange
        const mockAccounts = accounts;  // Your mock account data

        // Act
        const app = await import('../app.js');
        const response = await request(app.default).get('/api/accounts');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(accounts);
    });
});
