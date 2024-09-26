import { jest } from '@jest/globals';
import request from 'supertest';
import express, {
    type Express,
    type Request,
    type Response,
    type NextFunction,
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
    const routerModule = await import('../../src/routes/payrollDatesRouter');
    const payrollDatesRouter: Router = routerModule.default;
    app.use('/', payrollDatesRouter);

    return app;
};

const payrollDates = {
    jobId: 1,
    payrollDay: 15,
};

beforeAll(() => {
    jest.mock('../../src/controllers/PayrollDatesController', () => ({
        getPayrollDates: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        getPayrollDatesById: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        createPayrollDate: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        togglePayrollDate: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        updatePayrollDate: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        deletePayrollDate: jest.fn((_: Request, res: Response) =>
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
            .get('/?job_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id param', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/1?job_id=1')
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
            .send(payrollDates);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('POST /toggle', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .post('/toggle')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(payrollDates);

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
            .send(payrollDates);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('DELETE /:id', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .delete('/1?job_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
