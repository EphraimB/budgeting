import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Factory function for creating an app with the mock router
const createApp = async () => {
    const app = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../routes/accountsRouter');
    accountsRouter = routerModule.default;
    app.use('/', accountsRouter);

    return app;
};

beforeAll(() => {
    jest.unstable_mockModule('../controllers/accountsController', () => ({
        getAccounts: (req, res, next) => res.json({ message: 'success' }),
        createAccount: (req, res, next) => res.json({ message: 'success' }),
        updateAccount: jest.fn(),
        deleteAccount: jest.fn(),
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
        const newAccount = {
            name: 'test',
            balance: 100,
            type: 1
        };

        const response = await request(app)
            .post('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(newAccount);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});