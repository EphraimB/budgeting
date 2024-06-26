import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getPayrollDates,
    createPayrollDate,
    createPayrollDateReturnObject,
    updatePayrollDate,
    updatePayrollDateReturnObject,
    deletePayrollDate,
    deletePayrollDateReturnObject,
    togglePayrollDate,
    togglePayrollDateReturnObject,
} from '../controllers/payrollDatesController.js';
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
        query('job_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollDates,
);

router.post(
    '/',
    [
        body('job_id').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payroll_day')
            .isInt({ min: 1, max: 31 })
            .withMessage('Payroll day must be a number between 1 and 31'),
        validateRequest,
    ],
    createPayrollDate,
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
    createPayrollDateReturnObject,
);

router.post(
    '/toggle',
    [
        body('job_id').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payroll_day')
            .isInt({ min: 1, max: 31 })
            .withMessage('Payroll day must be a number between 1 and 31'),
        validateRequest,
    ],
    togglePayrollDate,
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
    togglePayrollDateReturnObject,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('job_id').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payroll_day')
            .isInt({ min: 1, max: 31 })
            .withMessage('Payroll day must be a number between 1 and 31'),
        validateRequest,
    ],
    updatePayrollDate,
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
    updatePayrollDateReturnObject,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollDate,
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
    deletePayrollDateReturnObject,
);

export default router;
