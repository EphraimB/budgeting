import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { getAccounts } from '../controllers/accountsController.js';
import { accounts } from '../models/mockData.js'; // Import the mock data

jest.unstable_mockModule('../models/db.js', () => {
    return {
        getAccounts: jest.fn().mockResolvedValue(accounts), // Mock the getAccounts function
    };
}); // Mock the entire db module

let server;

beforeAll(() => {
    server = app.listen();
});

afterAll(() => {
    server.close();
});

afterEach(() => {
    // Clear the mock implementation after each test
    jest.clearAllMocks();
});

describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        const mockGetAccounts = jest.fn().mockResolvedValue(accounts);

        getAccounts.mockImplementation(mockGetAccounts);

        const response = await request(app).get('/api/accounts');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(accounts);
    });
});