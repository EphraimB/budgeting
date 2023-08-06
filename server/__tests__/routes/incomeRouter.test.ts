import { jest } from '@jest/globals';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction, Router } from 'express';
import MockDate from 'mockdate';

/**
 * 
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/incomeRouter');
    const incomeRouter: Router = routerModule.default;
    app.use('/', incomeRouter);

    return app;
};

beforeAll(() => {
    MockDate.set('2019-01-01');

    jest.mock('../../middleware/middleware', () => ({
        setQueries: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getCurrentBalance: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getTransactionsByAccount: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getIncomeByAccount: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getExpensesByAccount: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getLoansByAccount: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getPayrollsMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getTransfersByAccount: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        getWishlistsByAccount: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        updateWishlistCron: jest.fn((req: Request, res: Response, next: NextFunction) => next())
    }));

    jest.mock('../../generation/generateTransactions', () => {
        return jest.fn((req: Request, res: Response, next: NextFunction) => {
            req.transactions = [];
            next();
        });
    });

    jest.mock('../../controllers/incomeController', () => ({
        getIncome: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        createIncome: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        createIncomeReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        updateIncome: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        updateIncomeReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        deleteIncome: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        deleteIncomeReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }))
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

describe('GET / with id query', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/?id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('POST /', () => {
    it('responds with json', async () => {
        const incomeObj = {
            account_id: 1,
            amount: 100,
            title: 'test',
            description: 'test',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: 1,
            frequency_week_of_month: 1,
            frequency_day_of_month: 1,
            frequency_month_of_year: 1,
            begin_date: '2020-01-01'
        };

        const response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(incomeObj);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('PUT /:id', () => {
    it('responds with json', async () => {
        const incomeObj = {
            account_id: 1,
            amount: 100,
            title: 'test',
            description: 'test',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: 1,
            frequency_week_of_month: 1,
            frequency_day_of_month: 1,
            frequency_month_of_year: 1,
            begin_date: '2020-01-01'
        };

        const response: request.Response = await request(app)
            .put('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(incomeObj);

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
