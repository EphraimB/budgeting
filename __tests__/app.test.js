import { jest } from '@jest/globals';
import request from 'supertest';

describe('Test application', () => {
    beforeAll(() => {
        // Mock the breeManager module
        jest.unstable_mockModule('../bree/breeManager.js', () => ({
            initializeBree: jest.fn(),
            getBree: jest.fn()
        }));

        // Mock the getJobs module
        jest.unstable_mockModule('../bree/getJobs.js', () => ({
            default: jest.fn()
        }));
    });

    afterAll(() => {
        // Restore the original console.log function
        jest.restoreAllMocks();
    });

    it('should trigger not found for site 404', async () => {
        const app = await import('../app.js');
        const response = await request(app.default).get('/no-such-path');
        expect(response.statusCode).toBe(404);
    });
});
