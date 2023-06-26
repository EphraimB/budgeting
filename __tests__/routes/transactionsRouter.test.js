import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

jest.unstable_mockModule('../../middleware/middleware', () => ({
    getCurrentBalance: (req, res, next) => {
        req.currentBalance = 100;
        next();
    },
    getTransactionsByAccount: (req, res, next) => {
        req.transactions = [];
        next();
    },
    getExpensesByAccount: (req, res, next) => {
        req.expenses = [];
        next();
    },
    getLoansByAccount: (req, res, next) => {
        req.loans = [];
        next();
    },
    getPayrollsMiddleware: (req, res, next) => {
        req.payrolls = [];
        next();
    },
    getTransfersByAccount: (req, res, next) => {
        req.transfers = [];
        next();
    },
    getWishlistsByAccount: (req, res, next) => {
        req.wishlists = [];
        next();
    },
}));

jest.unstable_mockModule('../../generation/generateTransactions', () => ({
    default: jest.fn().mockImplementation((req, res, next) => {
        req.transactions = [];
        next();
    })
}));

const { default: router } = await import('../../routes/transactionsRouter.js');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Testing / route', () => {
    it('should respond with a 200 status and the correct data', async () => {
        const accountId = 1;
        const fromDate = '2023-01-01';
        const toDate = '2023-01-31';

        const response = await request(app)
            .get('/')
            .query({ account_id: accountId, from_date: fromDate, to_date: toDate });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('account_id');
        expect(response.body).toHaveProperty('currentBalance');
        expect(response.body).toHaveProperty('transactions');
        expect(response.body.account_id).toBe(accountId);
        expect(response.body.currentBalance).toBe(100);
        expect(response.body.transactions).toEqual([]);
    });

    it('should respond with a 400 status for invalid request', async () => {
        const response = await request(app)
            .get('/')
            .query({ account_id: 'invalid', from_date: 'invalid', to_date: 'invalid' });

        expect(response.status).toBe(400);
    });
});
