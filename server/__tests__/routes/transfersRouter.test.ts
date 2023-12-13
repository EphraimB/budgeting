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
    const routerModule = await import('../../routes/transfersRouter');
    const transfersRouter: Router = routerModule.default;
    app.use('/', transfersRouter);

    return app;
};

const createFutureTransfer = () => {
    const dateInFuture = new Date();
    dateInFuture.setDate(dateInFuture.getDate() + 7);

    return {
        source_account_id: 1,
        destination_account_id: 2,
        amount: 100,
        title: 'test',
        description: 'test',
        frequency_type: 2,
        begin_date: dateInFuture,
    };
};

beforeAll(() => {
    jest.mock('../../middleware/middleware', () => ({
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

    jest.mock('../../generation/generateTransactions', () => {
        return jest.fn((req: Request, res: Response, next: NextFunction) => {
            req.transactions = [];
            next();
        });
    });

    jest.mock('../../controllers/transfersController', () => ({
        getTransfers: jest.fn(
            (req: Request, res: Response, next: NextFunction) =>
                res.json({ message: 'success' }),
        ),
        createTransfer: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        createTransferReturnObject: jest.fn(
            (req: Request, res: Response, next: NextFunction) =>
                res.json({ message: 'success' }),
        ),
        updateTransfer: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        updateTransferReturnObject: jest.fn(
            (req: Request, res: Response, next: NextFunction) =>
                res.json({ message: 'success' }),
        ),
        deleteTransfer: jest.fn(
            (req: Request, res: Response, next: NextFunction) => {
                next();
            },
        ),
        deleteTransferReturnObject: jest.fn(
            (req: Request, res: Response, next: NextFunction) =>
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
        const response = await request(app)
            .get('/?account_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id query', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/?account_id=1&id=1')
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
            .send(createFutureTransfer());

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
            .send(createFutureTransfer());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('DELETE /:id', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .delete('/1?account_id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});
