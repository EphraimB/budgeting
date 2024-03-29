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
    account_id: 1,
    name: 'test',
    hourly_rate: 10,
    vacation_days: 10,
    sick_days: 10,
    job_schedule: [
        {
            day_of_week: 1,
            start_time: '09:00:00',
            end_time: '17:00:00',
        },
        {
            day_of_week: 2,
            start_time: '09:00:00',
            end_time: '17:00:00',
        },
        {
            day_of_week: 3,
            start_time: '09:00:00',
            end_time: '17:00:00',
        },
        {
            day_of_week: 4,
            start_time: '09:00:00',
            end_time: '17:00:00',
        },
        {
            day_of_week: 5,
            start_time: '09:00:00',
            end_time: '17:00:00',
        },
    ],
};

beforeAll(() => {
    jest.mock('../../src/middleware/middleware', () => ({
        setQueries: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getCurrentBalance: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getTransactionsByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getIncomeByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getExpensesByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getLoansByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getPayrollsMiddleware: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getTransfersByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getCommuteExpensesByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        getWishlistsByAccount: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        updateWishlistCron: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
    }));

    jest.mock('../../src/generation/generateTransactions', () => {
        return jest.fn((req: Request, res: Response, next: NextFunction) => {
            req.transactions = [];
            next();
        });
    });

    jest.mock('../../src/controllers/jobsController', () => ({
        getJobs: jest.fn((req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
        ),
        createJob: jest.fn((req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
        ),
        updateJob: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        updateJobReturnObject: jest.fn(
            (req: Request, res: Response, next: NextFunction) =>
                res.json({ message: 'success' }),
        ),
        deleteJob: jest.fn((req: Request, res: Response, next: NextFunction) =>
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

describe('GET / with id query', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/?job_id=1')
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
