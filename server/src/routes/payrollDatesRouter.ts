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
    getPayrollDatesById,
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
        query('jobId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollDates,
);

router.get(
    '/',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        query('jobId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollDatesById,
);

router.post(
    '/',
    [
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payrollDay')
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
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payrollDay')
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
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payrollDay')
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
