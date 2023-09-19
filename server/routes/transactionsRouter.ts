import express, { type Router, type Request, type Response } from 'express';
import generateTransactions from '../generation/generateTransactions.js';
import {
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getWishlistsByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
} from '../middleware/middleware.js';
import { query } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';

declare module 'express-serve-static-core' {
    interface Request {
        transactions: any[];
    }
}

const router: Router = express.Router();

// Generate the transactions based on current balance, expenses, and loans
router.get(
    '/',
    [
        query('account_id')
            .exists()
            .withMessage('Account ID is required')
            .isInt({ min: 0 })
            .withMessage('Account ID must be an integer'),
        query('from_date')
            .exists()
            .withMessage('From date is required')
            .isDate()
            .withMessage('From date must be a date in YYYY-MM-DD format'),
        query('to_date')
            .exists()
            .withMessage('To date is required')
            .isDate()
            .withMessage('To date must be a date in YYYY-MM-DD format'),
        validateRequest,
    ],
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    (request: Request, response: Response) => {
        response.json(request.transactions);
    },
);

export default router;
