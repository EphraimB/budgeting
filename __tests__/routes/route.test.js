import request from 'supertest';
import express from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/routes');
    const router = routerModule.default;
    app.use('/', router);

    return app;
};

let app;

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
