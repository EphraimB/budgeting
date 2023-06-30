import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/payrollDatesRouter');
    const payrollDatesRouter = routerModule.default;
    app.use('/', payrollDatesRouter);

    return app;
};

const payrollDates = {
    employee_id: 1,
    start_day: 1,
    end_day: 15
};

beforeAll(() => {
    jest.unstable_mockModule('../../controllers/PayrollDatesController', () => ({
        getPayrollDates: (req, res, next) => res.json({ message: 'success' }),
        createPayrollDate: (req, res, next) => res.json({ message: 'success' }),
        updatePayrollDate: (req, res, next) => res.json({ message: 'success' }),
        deletePayrollDate: (req, res, next) => res.json({ message: 'success' })
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
            .get('/?employee_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id query', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/?employee_id=1&id=1')
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
            .send(payrollDates);

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
            .send(payrollDates);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('DELETE /:id', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .delete('/1?employee_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
