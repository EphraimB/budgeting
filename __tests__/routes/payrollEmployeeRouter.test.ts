import { jest } from '@jest/globals';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction, Router } from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../routes/payrollEmployeeRouter');
    const payrollEmployeeRouter: Router = routerModule.default;
    app.use('/', payrollEmployeeRouter);

    return app;
};

const newPayrollEmployee = {
    name: 'test',
    hourly_rate: 10,
    regular_hours: 40,
    vacation_days: 10,
    sick_days: 10,
    work_schedule: '0111100'
};

beforeAll(() => {
    jest.mock('../../controllers/employeesController', () => ({
        getEmployee: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        createEmployee: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        updateEmployee: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        deleteEmployee: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })
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
            .get('/?employee_id=1')
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
            .send(newPayrollEmployee);

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
            .send(newPayrollEmployee);

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
