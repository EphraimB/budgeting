import request from 'supertest';
import express, {
    type Express,
    type Request,
    type Response,
    type NextFunction,
    type Router,
} from 'express';
import { jest, beforeAll, describe, it, expect } from '@jest/globals';

jest.mock('../../src/middleware/middleware', () => ({
    getCurrentBalance: (req: Request, res: Response, next: NextFunction) => {
        req.currentBalance = [{ account_id: 1, account_balance: 100 }];
        next();
    },
    getTransactionsByAccount: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        req.transactions = [];
        next();
    },
    getIncomeByAccount: (req: Request, res: Response, next: NextFunction) => {
        req.income = [];
        next();
    },
    getExpensesByAccount: (req: Request, res: Response, next: NextFunction) => {
        req.expenses = [];
        next();
    },
    getLoansByAccount: (req: Request, res: Response, next: NextFunction) => {
        req.loans = [];
        next();
    },
    getPayrollsMiddleware: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        req.payrolls = [];
        next();
    },
    getTransfersByAccount: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        req.transfers = [];
        next();
    },
    getCommuteExpensesByAccount: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        req.commuteExpenses = [];
        next();
    },
    getWishlistsByAccount: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        req.wishlists = [];
        next();
    },
}));

jest.mock('../../src/generation/generateTransactions', () => {
    return jest.fn((req: Request, res: Response, next: NextFunction) => {
        req.transactions = [
            {
                account_id: 1,
                current_balance: 100,
                transactions: [],
            },
        ];
        next();
    });
});

/**
 *
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
    const app: Express = express();
    app.use(express.json());

    // Import the module that uses the mock
    const routerModule = await import('../../src/routes/transactionsRouter');
    const transactionsRouter: Router = routerModule.default;
    app.use('/', transactionsRouter);

    return app;
};

let app: Express;

beforeAll(async () => {
    // Create a new app for each test
    app = await createApp();
});

describe('Testing / route', () => {
    it('should respond with a 200 status and the correct data', async () => {
        const accountId: number = 1;
        const fromDate: string = '2023-01-01';
        const toDate: string = '2023-01-31';

        const response: request.Response = await request(app).get('/').query({
            account_id: accountId,
            from_date: fromDate,
            to_date: toDate,
        });

        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('account_id');
        expect(response.body[0]).toHaveProperty('current_balance');
        expect(response.body[0]).toHaveProperty('transactions');
        expect(response.body[0].account_id).toBe(accountId);
        expect(response.body[0].current_balance).toBe(100);
        expect(response.body[0].transactions).toEqual([]);
    });

    it('should respond with a 400 status for invalid request', async () => {
        const response: request.Response = await request(app).get('/').query({
            account_id: 'invalid',
            from_date: 'invalid',
            to_date: 'invalid',
        });

        expect(response.status).toBe(400);
    });
});
