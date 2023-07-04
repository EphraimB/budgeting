import { Router, Request, Response } from 'express';
import express from 'express';
import generateTransactions from '../generation/generateTransactions.js';
import { getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getWishlistsByAccount, getPayrollsMiddleware, getTransfersByAccount } from '../middleware/middleware.js';
import { query } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';

declare module 'express-serve-static-core' {
    interface Request {
        transactions: any[];
    }
}

const router: Router = express.Router();

// Generate the transactions based on current balance, expenses, and loans
router.get('/', [
    query('account_id').exists().withMessage('Account ID is required').isInt({ min: 0 }).withMessage('Account ID must be an integer'),
    query('from_date').exists().withMessage('From date is required').isDate().withMessage('From date must be a date in YYYY-MM-DD format'),
    query('to_date').exists().withMessage('To date is required').isDate().withMessage('To date must be a date in YYYY-MM-DD format'),
    validateRequest
], getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, generateTransactions, (request: Request, response: Response) => {
    response.json({ account_id: request.query.account_id, currentBalance: request.currentBalance, transactions: request.transactions });
});

export default router;
