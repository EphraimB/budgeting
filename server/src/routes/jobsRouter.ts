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
        body('vacation_days')
            .isInt({ min: 0 })
            .withMessage('Vacation days must be a number'),
        body('sick_days')
            .isFloat({ min: 0 })
            .withMessage('Sick days must be a number'),
        body('job_schedule')
            .isArray()
            .withMessage('Work schedule must be an array'),
        body('job_schedule.*.day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number'),
        body('job_schedule.*.start_time')
            .isString()
            .withMessage('Start time must be a string')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be in HH:MM:SS format'),

        body('job_schedule.*.end_time')
            .isString()
            .withMessage('End time must be a string')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('End time must be in HH:MM:SS'),
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
        body('vacation_days')
            .isInt({ min: 0 })
            .withMessage('Vacation days must be a number'),
        body('sick_days')
            .isFloat({ min: 0 })
            .withMessage('Sick days must be a number'),
        body('job_schedule')
            .isArray()
            .withMessage('Work schedule must be an array'),
        body('job_schedule.*.day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number'),
        body('job_schedule.*.start_time')
            .isString()
            .withMessage('Start time must be a string')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be in HH:MM:SS format'),

        body('job_schedule.*.end_time')
            .isString()
            .withMessage('End time must be a string')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('End time must be in HH:MM:SS format'),
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
