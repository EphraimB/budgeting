import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getJobs,
    createJob,
    updateJob,
    updateJobReturnObject,
    deleteJob,
} from '../controllers/jobsController.js';
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
        query('job_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getJobs,
);

router.post(
    '/',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourly_rate')
            .isFloat({ min: 0 })
            .withMessage('Hourly rate must be a number'),
        body('regular_hours')
            .isInt({ min: 0 })
            .withMessage('Regular hours must be a number'),
        body('vacation_days')
            .isInt({ min: 0 })
            .withMessage('Vacation days must be a number'),
        body('sick_days')
            .isFloat({ min: 0 })
            .withMessage('Sick days must be a number'),
        body('work_schedule')
            .isString()
            .withMessage('Work schedule must be a string'),
        validateRequest,
    ],
    createJob,
);

router.put(
    '/:job_id',
    [
        param('job_id')
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourly_rate')
            .isFloat({ min: 0 })
            .withMessage('Hourly rate must be a number'),
        body('regular_hours')
            .isInt({ min: 0 })
            .withMessage('Regular hours must be a number'),
        body('vacation_days')
            .isInt({ min: 0 })
            .withMessage('Vacation days must be a number'),
        body('sick_days')
            .isFloat({ min: 0 })
            .withMessage('Sick days must be a number'),
        body('work_schedule')
            .isString()
            .withMessage('Work schedule must be a string'),
        validateRequest,
    ],
    updateJob,
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
    updateJobReturnObject,
);

router.delete(
    '/:job_id',
    [
        param('job_id')
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    deleteJob,
);

export default router;
