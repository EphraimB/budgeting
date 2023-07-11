import { jest } from '@jest/globals';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction, Router } from 'express';

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
        begin_date: dateInFuture
    };
};

beforeAll(() => {
    jest.mock('../../controllers/transfersController', () => ({
        getTransfers: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        createTransfer: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        updateTransfer: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' }),
        deleteTransfer: (req: Request, res: Response, next: NextFunction) => res.json({ message: 'success' })
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
