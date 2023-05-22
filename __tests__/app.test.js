import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe("Test application", () => {
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
    });

    afterAll(() => {
        // Restore the original console.log function
        jest.restoreAllMocks();
    });

    test("Not found for site 404", async () => {
        const response = await request(app).get("/no-such-path");
        expect(response.statusCode).toBe(404);
    });
});