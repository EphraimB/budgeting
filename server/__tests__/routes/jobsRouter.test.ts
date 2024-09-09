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
import { getJobsById } from '../../src/controllers/jobsController';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../src/routes/jobsRouter');
    const jobsRouter: Router = routerModule.default;
    app.use('/', jobsRouter);

    return app;
};

const newJob = {
    accountId: 1,
    name: 'test',
    hourlyRate: 10,
    vacationDays: 10,
    sickDays: 10,
    jobSchedule: [
        {
            dayOfWeek: 1,
            startTime: '09:00:00',
            endTime: '17:00:00',
        },
        {
            dayOfWeek: 2,
            startTime: '09:00:00',
            endTime: '17:00:00',
        },
        {
            dayOfWeek: 3,
            startTime: '09:00:00',
            endTime: '17:00:00',
        },
        {
            dayOfWeek: 4,
            startTime: '09:00:00',
            endTime: '17:00:00',
        },
        {
            dayOfWeek: 5,
            startTime: '09:00:00',
            endTime: '17:00:00',
        },
    ],
};

beforeAll(() => {
    jest.mock('../../src/controllers/jobsController', () => ({
        getJobs: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        getJobsById: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        createJob: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        updateJob: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        deleteJob: jest.fn((req: Request, res: Response) =>
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
        const response: request.Response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(newJob);

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
            .send(newJob);

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
