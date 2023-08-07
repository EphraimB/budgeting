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
    const routerModule = await import('../../routes/expensesRouter');
    const expensesRouter: Router = routerModule.default;
    app.use('/', expensesRouter);

    return app;
};

const createFutureExpense = () => {
    const dateInFuture = new Date();
    dateInFuture.setDate(dateInFuture.getDate() + 7);

    return {
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
        subsidized: 0,
        begin_date: dateInFuture.toISOString()
    };
};

beforeAll(() => {
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

    jest.mock('../../controllers/expensesController', () => ({
        getExpenses: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        createExpense: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        createExpenseReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        updateExpense: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        updateExpenseReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        deleteExpense: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        deleteExpenseReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }))
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
