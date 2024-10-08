import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsById,
} from '../controllers/transactionHistoryController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getTransactions,
);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getTransactionsById,
);

router.post(
    '/',
    [
        body('accountId')
            .isNumeric()
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('tax').isNumeric().withMessage('Tax must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        validateRequest,
    ],
    createTransaction,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('tax').isNumeric().withMessage('Tax must be a number'),
        body('accountId')
            .isNumeric()
            .withMessage('Account ID must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        validateRequest,
    ],
    updateTransaction,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteTransaction,
);

export default router;
