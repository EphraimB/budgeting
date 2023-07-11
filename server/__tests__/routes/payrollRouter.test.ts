import { jest } from '@jest/globals';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction, Router } from 'express';

/**
 * 
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/payrollRouter');
    const payrollRouter: Router = routerModule.default;
    app.use('/', payrollRouter);

    return app;
};

beforeAll(() => {
    jest.mock('../../controllers/payrollsController', () => ({
        getPayrolls: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })
    }));
});

afterAll(() => {
    jest.restoreAllMocks();
});

let app: Express;

beforeEach(async () => {
    // Create a new app for each test
    app = await createApp();
});

describe('GET /', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/?employee_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

            console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
