import { jest } from '@jest/globals';
import request from 'supertest';

describe('GET /api', () => {
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

    it('should respond with "Hello, World!"', async () => {
        const app = await import('../app.js');
        const response = await request(app.default).get('/api');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    });
});