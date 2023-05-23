import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

jest.unstable_mockModule('../controllers/accountsController', () => ({
    getAccounts: (req, res, next) => res.json({ message: 'success' }),
    createAccount: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
}));

let accountsRouter;

const app = express();
app.use(express.json());

describe('GET /', () => {
    beforeAll(async () => {
        // Then, import the module that uses the mock
        const routerModule = await import('../routes/accountsRouter');
        accountsRouter = routerModule.default;
        app.use('/', accountsRouter);
    });

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
    beforeAll(async () => {
        // Then, import the module that uses the mock
        const routerModule = await import('../routes/accountsRouter');
        accountsRouter = routerModule.default;
        app.use('/', accountsRouter);
    });

    it('responds with json', async () => {
        const response = await request(app)
            .get('/?id=1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'success' });
    });
});