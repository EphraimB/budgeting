import { jest } from '@jest/globals';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction, Router } from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/loansRouter');
    const loansRouter: Router = routerModule.default;
    app.use('/', loansRouter);

    return app;
};

const createFutureLoan = () => {
    const dateInFuture: Date = new Date();
    dateInFuture.setDate(dateInFuture.getDate() + 7);

    return {
        account_id: 1,
        amount: 1000,
        plan_amount: 100,
        recipient: 'test',
        title: 'test',
        description: 'test',
        frequency_type: 1,
        frequency_type_variable: 1,
        frequency_day_of_week: 1,
        frequency_week_of_month: 1,
        frequency_day_of_month: 1,
        frequency_month_of_year: 1,
        begin_date: dateInFuture.toISOString()
    };
};

beforeAll(() => {
    jest.mock('../../controllers/loansController', () => ({
        getLoans: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        createLoan: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        updateLoan: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        deleteLoan: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })
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
        const response: request.Response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(createFutureLoan());

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
            .send(createFutureLoan());

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
