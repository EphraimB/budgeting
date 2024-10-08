import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobsById,
} from '../controllers/jobsController.js';
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
    getJobs,
);

router.get(
    '/:id',
    [
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        param('id').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getJobsById,
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
        body('jobSchedule')
            .isArray()
            .withMessage('Job schedule must be an array'),
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
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourlyRate')
            .isFloat({ min: 0 })
            .withMessage('Hourly rate must be a number'),
        body('jobSchedule')
            .isArray()
            .withMessage('Job schedule must be an array'),
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
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        validateRequest,
    ],
    deleteJob,
);

export default router;
