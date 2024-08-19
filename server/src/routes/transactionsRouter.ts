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
import { param, query } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';
import { getTransactionsByAccountId } from 'src/controllers/transactionsController.js';

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
        query('fromDate')
            .exists()
            .withMessage('From date is required')
            .isDate()
            .withMessage('From date must be a date in YYYY-MM-DD format'),
        query('toDate')
            .exists()
            .withMessage('To date is required')
            .isDate()
            .withMessage('To date must be a date in YYYY-MM-DD format'),
        validateRequest,
    ],
    getTransactions,
);

router.get(
    '/:id',
    [
        param('accountId')
            .exists()
            .withMessage('Account ID is required')
            .isInt({ min: 1 })
            .withMessage('Account ID must be an integer'),
        query('fromDate')
            .exists()
            .withMessage('From date is required')
            .isDate()
            .withMessage('From date must be a date in YYYY-MM-DD format'),
        query('toDate')
            .exists()
            .withMessage('To date is required')
            .isDate()
            .withMessage('To date must be a date in YYYY-MM-DD format'),
        validateRequest,
    ],
    getTransactionsByAccountId,
);

export default router;
