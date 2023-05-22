import { jest } from '@jest/globals';

// Mock the breeManager module
jest.unstable_mockModule('../breeManager.js', () => ({
    startBree: jest.fn(),
    bree: {}, // Mock the bree object with an empty object or provide any other mock implementation
}));

// Mock the console.log function
console.log = jest.fn();

import request from 'supertest';
import app from '../app.js';

let server;

beforeAll(() => {
    server = app.listen();
});

afterAll(() => {
    server.close();
});

describe('GET /api', () => {
    it('should respond with "Hello, World!"', async () => {
        const response = await request(app).get('/api');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    });
});

describe('GET /api/accounts', () => {
    it('should respond with "Accounts"', async () => {
        const response = await request(app).get('/api/accounts');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Accounts');
    });
});