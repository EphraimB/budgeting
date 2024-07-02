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
    const routerModule = await import('../../src/routes/commuteScheduleRouter');
    const commuteScheduleRouter: Router = routerModule.default;
    app.use('/', commuteScheduleRouter);

    return app;
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
        createCommuteScheduleReturnObject: jest.fn(
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

    jest.mock('../../src/controllers/commuteScheduleController', () => ({
        getCommuteSchedule: (req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
        createCommuteSchedule: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => res.json({ message: 'success' }),
        createCommuteScheduleReturnObject: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => res.json({ message: 'success' }),
        updateCommuteSchedule: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => res.json({ message: 'success' }),
        updateCommuteScheduleReturnObject: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => res.json({ message: 'success' }),
        deleteCommuteSchedule: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => res.json({ message: 'success' }),
        deleteCommuteScheduleReturnObject: (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => res.json({ message: 'success' }),
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

describe('GET / with account_id query', () => {
    it('responds with json', async () => {
        const response: request.Response = await request(app)
            .get('/?account_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('POST /', () => {
    it('responds with json', async () => {
        const newSchedule = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            fare_detail_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        const response: request.Response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(newSchedule);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('PUT /:id', () => {
    it('responds with json', async () => {
        const updatedSchedule = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            fare_detail_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        const response: request.Response = await request(app)
            .put('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(updatedSchedule);

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
