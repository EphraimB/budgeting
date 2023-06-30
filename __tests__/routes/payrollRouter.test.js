import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/payrollRouter');
    const payrollRouter = routerModule.default;
    app.use('/', payrollRouter);

    return app;
};

beforeAll(() => {
    jest.unstable_mockModule('../../controllers/payrollsController', () => ({
        getPayrolls: (req, res, next) => res.json({ message: 'success' })
    }));
});

afterAll(() => {
    jest.restoreAllMocks();
});

let app;

beforeEach(async () => {
    // Create a new app for each test
    app = await createApp();
});

describe('GET /', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/?employee_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
