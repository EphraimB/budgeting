import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/expensesRouter');
    const expensesRouter = routerModule.default;
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
        begin_date: dateInFuture.toISOString()
    };
};

beforeAll(() => {
    jest.unstable_mockModule('../../controllers/expensesController', () => ({
        getExpenses: (req, res, next) => res.json({ message: 'success' }),
        createExpense: (req, res, next) => res.json({ message: 'success' }),
        updateExpense: (req, res, next) => res.json({ message: 'success' }),
        deleteExpense: (req, res, next) => res.json({ message: 'success' }),
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
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id query', () => {
    it('responds with json', async () => {
        const response = await request(app)
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
        const response = await request(app)
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
        const response = await request(app)
            .delete('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});