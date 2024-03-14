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

const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

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
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage('Start time must be in HH:MM format')
            .custom((value, { req, path }) => {
                const startTime = convertTimeToMinutes(value);
                if (
                    startTime < convertTimeToMinutes('00:00') ||
                    startTime > convertTimeToMinutes('23:59')
                ) {
                    return Promise.reject(
                        'Start time is out of bounds (00:00 to 23:59)',
                    );
                }

                // Extract index to compare with end time
                const index = path.split('.')[2];
                const endTime = convertTimeToMinutes(
                    req.body.work_schedule[index].end_time,
                );

                if (endTime <= startTime) {
                    return Promise.reject(
                        'End time must be greater than start time',
                    );
                }

                return true;
            }),

        body('job_schedule.*.end_time')
            .isString()
            .withMessage('End time must be a string')
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage('End time must be in HH:MM format')
            .custom((value) => {
                const endTime = convertTimeToMinutes(value);
                if (
                    endTime < convertTimeToMinutes('00:00') ||
                    endTime > convertTimeToMinutes('23:59')
                ) {
                    return Promise.reject(
                        'End time is out of bounds (00:00 to 23:59)',
                    );
                }
                return true;
            }),
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
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage('Start time must be in HH:MM format')
            .custom((value, { req, path }) => {
                const startTime = convertTimeToMinutes(value);
                if (
                    startTime < convertTimeToMinutes('00:00') ||
                    startTime > convertTimeToMinutes('23:59')
                ) {
                    return Promise.reject(
                        'Start time is out of bounds (00:00 to 23:59)',
                    );
                }

                // Extract index to compare with end time
                const index = path.split('.')[2];
                const endTime = convertTimeToMinutes(
                    req.body.work_schedule[index].end_time,
                );

                if (endTime <= startTime) {
                    return Promise.reject(
                        'End time must be greater than start time',
                    );
                }

                return true;
            }),

        body('job_schedule.*.end_time')
            .isString()
            .withMessage('End time must be a string')
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage('End time must be in HH:MM format')
            .custom((value) => {
                const endTime = convertTimeToMinutes(value);
                if (
                    endTime < convertTimeToMinutes('00:00') ||
                    endTime > convertTimeToMinutes('23:59')
                ) {
                    return Promise.reject(
                        'End time is out of bounds (00:00 to 23:59)',
                    );
                }
                return true;
            }),
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
