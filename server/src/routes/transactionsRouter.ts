import express, { type Router } from 'express';
import { param, query } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';
import {
    getTransactions,
    getTransactionsByAccountId,
} from '../controllers/transactionsController.js';

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
