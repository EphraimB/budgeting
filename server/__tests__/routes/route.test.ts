import request from 'supertest';
import express, { type Express, type Router } from 'express';

/**
 *
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/routes');
    const router: Router = routerModule.default;
    app.use('/', router);

    return app;
};

let app: Express;

beforeEach(async () => {
    // Create a new app for each test
    app = await createApp();
});

describe('GET /api', () => {
    it('should respond with "Hello, World!"', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    });
});
