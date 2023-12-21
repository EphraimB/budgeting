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
    const routerModule = await import('../../routes/fareDetailsRouter');
    const fareDetailsRouter: Router = routerModule.default;
    app.use('/', fareDetailsRouter);

    return app;
};

beforeAll(() => {
    jest.mock('../../controllers/fareDetailsController', () => ({
        getFareDetails: (req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
        createFareDetail: (req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
        updateFareDetail: (req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
        deleteFareDetail: (req: Request, res: Response, next: NextFunction) =>
            res.json({ message: 'success' }),
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
        const newFareDetail = {
            account_id: 1,
            commute_system_id: 1,
            name: 'Single Ride',
            fare_amount: 2.75,
            begin_in_effect_day_of_week: 1,
            begin_in_effect_time: '00:00:00',
            end_in_effect_day_of_week: 6,
            end_in_effect_time: '23:59:59',
        };

        const response: request.Response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(newFareDetail);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});

describe('PUT /:id', () => {
    it('responds with json', async () => {
        const newFareDetail = {
            account_id: 1,
            commute_system_id: 1,
            name: 'Single Ride',
            fare_amount: 2.75,
            begin_in_effect_day_of_week: 1,
            begin_in_effect_time: '00:00:00',
            end_in_effect_day_of_week: 6,
            end_in_effect_time: '23:59:59',
        };

        const response: request.Response = await request(app)
            .put('/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(newFareDetail);

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
