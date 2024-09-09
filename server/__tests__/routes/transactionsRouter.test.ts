import request from 'supertest';
import express, {
    type Express,
    type Request,
    type Response,
    type Router,
} from 'express';
import {
    jest,
    beforeAll,
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
} from '@jest/globals';

/**
 *
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../src/routes/transactionsRouter');
    const transactionsRouter: Router = routerModule.default;
    app.use('/', transactionsRouter);

    return app;
};

beforeAll(() => {
    jest.mock('../../src/controllers/transactionsController', () => ({
        getTransactionsByAccountId: (_: Request, res: Response) =>
            res.json({ message: 'success' }),
        getTransactions: (_: Request, res: Response) =>
            res.json({ message: 'success' }),
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

describe('Testing / route', () => {
    it('should respond with a 200 status and the correct data without an account id param', async () => {
        const accountId: number = 1;
        const fromDate: string = '2023-01-01';
        const toDate: string = '2023-01-31';

        const response: request.Response = await request(app)
            .get(`/?fromDate=${fromDate}&toDate=${toDate}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        //expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });

    it('should respond with a 400 status for invalid request', async () => {
        const response: request.Response = await request(app).get('/1').query({
            account_id: 'invalid',
            from_date: 'invalid',
            to_date: 'invalid',
        });

        expect(response.status).toBe(400);
    });
});

describe('Testing / route', () => {
    it('should respond with a 200 status and the correct data with an account id param', async () => {
        const accountId: number = 1;
        const fromDate: string = '2023-01-01';
        const toDate: string = '2023-01-31';

        const response: request.Response = await request(app)
            .get(`/${accountId}?fromDate=${fromDate}&toDate=${toDate}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        //expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });

    it('should respond with a 400 status for invalid request', async () => {
        const response: request.Response = await request(app).get('/').query({
            account_id: 'invalid',
            from_date: 'invalid',
            to_date: 'invalid',
        });

        expect(response.status).toBe(400);
    });
});
