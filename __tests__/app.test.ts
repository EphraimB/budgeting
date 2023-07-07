import { jest } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';

// Mock the breeManager module
jest.mock('../bree/breeManager.js', () => ({
    initializeBree: jest.fn(),
    getBree: jest.fn()
}));

jest.mock('../bree/getJobs.js', () => ({
    default: jest.fn()
}));

jest.mock('../bree/jobs/scheduleCronJob.js', () => ({
    default: jest.fn()
}));

jest.mock('../bree/jobs/deleteCronJob.js', () => ({
    default: jest.fn()
}));

jest.mock('../bree/getPayrolls.js', () => ({
    default: jest.fn()
}));

describe('Test application', () => {
    it('should trigger not found for site 404', async () => {
        // Import the module that uses the mock
        const appModule = await import('../app.js');
        const app: Express = appModule.default;

        const response: request.Response = await request(app).get('/no-such-path');
        expect(response.statusCode).toBe(404);
    });
});
