import { jest } from '@jest/globals';
import request from 'supertest';
import express, {
    type Express,
    type Request,
    type Response,
    type NextFunction,
    type Router,
} from 'express';
import MockDate from 'mockdate';
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
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../src/routes/loansRouter');
    const loansRouter: Router = routerModule.default;
    app.use('/', loansRouter);

    return app;
};

beforeAll(() => {
    MockDate.set('2020-01-01');

    jest.mock('../../src/controllers/loansController', () => ({
        getLoans: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        getLoansById: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        createLoan: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        updateLoan: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        deleteLoan: jest.fn((_: Request, res: Response) =>
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
        const newLoan = {
            accountId: 1,
            amount: 1000,
            planAmount: 100,
            recipient: 'test',
            title: 'test',
            description: 'test',
            frequencyType: 1,
            frequencyTypeVariable: 1,
            frequencyDayOfWeek: 1,
            frequencyWeekOfMonth: 1,
            frequencyDayOfMonth: 1,
            frequencyMonthOfYear: 1,
            interestRate: 0,
            interestFrequencyType: 2,
            beginDate: '2020-01-02',
        };

        const response: request.Response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(newLoan);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('PUT /:id', () => {
    it('responds with json', async () => {
        const updatedLoan = {
            accountId: 1,
            amount: 1000,
            planAmount: 100,
            recipient: 'test',
            title: 'test',
            description: 'test',
            frequencyType: 1,
            frequencyTypeVariable: 1,
            frequencyDayOfWeek: 1,
            frequencyWeekOfMonth: 1,
            frequencyDayOfMonth: 1,
            frequencyMonthOfYear: 1,
            interestRate: 0,
            interestFrequencyType: 2,
            beginDate: '2020-01-02',
        };

        const response: request.Response = await request(app)
            .put('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(updatedLoan);

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
