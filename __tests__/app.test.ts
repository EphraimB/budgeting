import { jest } from '@jest/globals';
import request from 'supertest';
import express, { Express, Router } from 'express';

/**
 * 
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../app.js');
    const router: Router = routerModule.default;
    app.use('/', router as express.Router);

    return app;
};

// Mock the breeManager module
jest.mock('../bree/breeManager.js', () => ({
    initializeBree: jest.fn(),
    getBree: jest.fn()
}));

// Mock the getJobs module
jest.mock('../bree/getJobs.js', () => ({
    default: jest.fn()
}));

let app: Express;

beforeEach(async () => {
    // Create a new app for each test
    app = await createApp();
});

describe('Test application', () => {
    it('should trigger not found for site 404', async () => {
        const response: request.Response = await request(app).get('/no-such-path');
        expect(response.statusCode).toBe(404);
    });
});
