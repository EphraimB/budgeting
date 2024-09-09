import { jest } from '@jest/globals';
import request from 'supertest';
import express, {
    type Express,
    type Request,
    type Response,
    type Router,
} from 'express';
import {
    beforeAll,
    afterAll,
    beforeEach,
    describe,
    it,
    expect,
} from '@jest/globals';

/**
 *
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../src/routes/expensesRouter');
    const expensesRouter: Router = routerModule.default;
    app.use('/', expensesRouter);

    return app;
};

const createFutureExpense = () => {
    const dateInFuture = new Date();
    dateInFuture.setDate(dateInFuture.getDate() + 7);

    return {
        accountId: 1,
        amount: 100,
        title: 'test',
        description: 'test',
        frequencyType: 1,
        frequencyTypeVariable: 1,
        frequencyDayOfWeek: 1,
        frequencyWeekOfMonth: 1,
        frequencyDayOfMonth: 1,
        frequencyMonthOfYear: 1,
        subsidized: 0,
        beginDate: dateInFuture.toISOString(),
    };
};

beforeAll(() => {
    jest.mock('../../src/controllers/expensesController', () => ({
        getExpenses: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        getExpensesById: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        createExpense: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        updateExpense: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        deleteExpense: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
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
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id param', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('POST /', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(createFutureExpense());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('PUT /:id', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .put('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(createFutureExpense());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('DELETE /:id', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .delete('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
