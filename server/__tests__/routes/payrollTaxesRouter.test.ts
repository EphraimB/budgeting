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
    const routerModule = await import('../../routes/payrollTaxesRouter');
    const payrollTaxesRouter: Router = routerModule.default;
    app.use('/', payrollTaxesRouter);

    return app;
};

const payrollTaxes = {
    employee_id: 1,
    name: 'test',
    rate: 0.1
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

    jest.mock('../../controllers/PayrollTaxesController', () => ({
        getPayrollTaxes: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        createPayrollTax: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        createPayrollTaxReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        updatePayrollTax: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        updatePayrollTaxReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })),
        deletePayrollTax: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
        deletePayrollTaxReturnObject: jest.fn((req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }))
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

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id query', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/?employee_id=1&id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('POST /', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(payrollTaxes);

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
            .send(payrollTaxes);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('DELETE /:id', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .delete('/1?employee_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
