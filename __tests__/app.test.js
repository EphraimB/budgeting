import {jest} from '@jest/globals';

// Mock the breeManager module
jest.unstable_mockModule('../breeManager.js', () => ({
    startBree: jest.fn(),
    bree: {}, // Mock the bree object with an empty object or provide any other mock implementation
}));

// Mock the console.log function
console.log = jest.fn();

import request from 'supertest';
import app from '../app.js';
import db from '../models/db.js';

describe("Test application", () => {
    test("Not found for site 404", async () => {
        const response = await request(app).get("/no-such-path");
        expect(response.statusCode).toBe(404);
    });
});

afterAll(async () => {
    await db.end();
});