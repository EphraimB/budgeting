import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getLoans,
    createLoan,
    createLoanReturnObject,
    updateLoan,
    updateLoanReturnObject,
    deleteLoan,
    deleteLoanReturnObject,
} from '../controllers/loansController.js';
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
        query('id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID must be a number'),
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
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
    getLoans,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('planAmount')
            .isNumeric()
            .withMessage('Planned amount must be a number'),
        body('recipient').isString().withMessage('Recipient must be a string'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequencyType')
            .optional()
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
        body('interestRate')
            .isNumeric()
            .withMessage('Interest rate must be a number'),
        body('interestFrequencyType')
            .isInt({ min: 0, max: 3 })
            .withMessage(
                'Interest frequency type must be a number between 0 and 3',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        validateRequest,
    ],
    createLoan,
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
    createLoanReturnObject,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('planAmount')
            .isNumeric()
            .withMessage('Planned amount must be a number'),
        body('recipient').isString().withMessage('Recipient must be a string'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequencyType')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequencyType_variable')
            .optional({ nullable: true })
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
        body('interestRate')
            .isNumeric()
            .withMessage('Interest rate must be a number'),
        body('interestFrequencyType')
            .isInt({ min: 0, max: 3 })
            .withMessage(
                'Interest frequency type must be a number between 0 and 3',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        validateRequest,
    ],
    updateLoan,
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
    updateLoanReturnObject,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteLoan,
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
    deleteLoanReturnObject,
);

export default router;
