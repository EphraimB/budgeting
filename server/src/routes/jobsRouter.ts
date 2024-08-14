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
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        query('id')
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
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourlyRate')
            .isFloat({ min: 0 })
            .withMessage('Hourly rate must be a number'),
        body('vacationDays')
            .isInt({ min: 0 })
            .withMessage('Vacation days must be a number'),
        body('sickDays')
            .isFloat({ min: 0 })
            .withMessage('Sick days must be a number'),
        body('jobSchedule')
            .isArray()
            .withMessage('Work schedule must be an array'),
        body('jobSchedule.*.dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number'),
        body('jobSchedule.*.startTime')
            .isString()
            .withMessage('Start time must be a string')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be in HH:MM:SS format'),

        body('jobSchedule.*.endTime')
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
        param('jobId')
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourlyRate')
            .isFloat({ min: 0 })
            .withMessage('Hourly rate must be a number'),
        body('vacationDays')
            .isInt({ min: 0 })
            .withMessage('Vacation days must be a number'),
        body('sickDays')
            .isFloat({ min: 0 })
            .withMessage('Sick days must be a number'),
        body('jobSchedule')
            .isArray()
            .withMessage('Work schedule must be an array'),
        body('jobSchedule.*.dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number'),
        body('jobSchedule.*.startTime')
            .isString()
            .withMessage('Start time must be a string')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be in HH:MM:SS format'),

        body('jobSchedule.*.endTime')
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
        param('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        validateRequest,
    ],
    deleteJob,
);

export default router;
