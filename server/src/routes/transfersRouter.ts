import express, { type Router } from 'express';
import {
    getTransfers,
    createTransfer,
    createTransferReturnObject,
    updateTransfer,
    updateTransferReturnObject,
    deleteTransfer,
    deleteTransferReturnObject,
} from '../controllers/transfersController.js';
import { param, query, body } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';
import generateTransactions from '../generation/generateTransactions.js';
import {
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    updateWishlistCron,
} from '../middleware/middleware.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('id').optional().isNumeric().withMessage('ID must be a number'),
        query('accountId')
            .optional()
            .isNumeric()
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getTransfers,
);

router.post(
    '/',
    [
        body('sourceAccountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('destinationAccountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequencyType')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequencyTypeVariable')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Frequency variable must be a number'),
        body('frequencyDayOfWeek')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Frequency day of week must be a number between 0 and 6',
            ),
        body('frequencyWeekOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 4 })
            .withMessage(
                'Frequency week of month must be a number between 0 and 4',
            ),
        body('frequencyDayOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 30 })
            .withMessage(
                'Frequency day of month must be a number between 0 and 30',
            ),
        body('frequencyMonthOfYear')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 11 })
            .withMessage(
                'Frequency month of year must be a number between 0 and 11',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        body('endDate')
            .optional({ nullable: true })
            .isDate()
            .withMessage('End date must be a date'),
        validateRequest,
    ],
    createTransfer,
    setQueries,
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
    updateWishlistCron,
    createTransferReturnObject,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('sourceAccountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('destinationAccountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequencyType')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequencyTypeVariable')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Frequency variable must be a number'),
        body('frequencyDayOfWeek')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Frequency day of week must be a number between 0 and 6',
            ),
        body('frequencyWeekOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 4 })
            .withMessage(
                'Frequency week of month must be a number between 0 and 4',
            ),
        body('frequencyDayOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 30 })
            .withMessage(
                'Frequency day of month must be a number between 0 and 30',
            ),
        body('frequencyMonthOfYear')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 11 })
            .withMessage(
                'Frequency month of year must be a number between 0 and 11',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        body('endDate')
            .optional({ nullable: true })
            .isDate()
            .withMessage('End date must be a date'),
        validateRequest,
    ],
    updateTransfer,
    setQueries,
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
    updateWishlistCron,
    updateTransferReturnObject,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteTransfer,
    setQueries,
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
    updateWishlistCron,
    deleteTransferReturnObject,
);

export default router;
