import { jest } from '@jest/globals';
import request from 'supertest';
import express, {
    type Express,
    type Request,
    type Response,
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
    const routerModule = await import('../../src/routes/transfersRouter');
    const transfersRouter: Router = routerModule.default;
    app.use('/', transfersRouter);

    return app;
};

beforeAll(() => {
    jest.mock('../../src/controllers/transfersController', () => ({
        getTransfers: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        getTransfersById: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        createTransfer: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        updateTransfer: jest.fn((_: Request, res: Response) =>
            res.json({ message: 'success' }),
        ),
        deleteTransfer: jest.fn((_: Request, res: Response) =>
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
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET /?accountId', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/?accountId=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id param', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('GET / with id param and accound id query', () => {
    it('responds with json', async () => {
        const response = await request(app)
            .get('/1?accountId=1')
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
            .send({
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
                title: 'test',
                description: 'test',
                frequency: {
                    type: 2,
                    typeVariable: 1,
                    dayOfWeek: null,
                    weekOfMonth: null,
                    dayOfMonth: null,
                    monthOfYear: null,
                },
                beginDate: '2020-01-01',
            });

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
            .send({
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
                title: 'test',
                description: 'test',
                frequency: {
                    type: 2,
                    typeVariable: 1,
                    dayOfWeek: null,
                    weekOfMonth: null,
                    dayOfMonth: null,
                    monthOfYear: null,
                },
                beginDate: '2020-01-01',
            });

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
