import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    createCommuteSchedule,
    deleteCommuteSchedule,
    getCommuteSchedule,
    getCommuteScheduleById,
    updateCommuteSchedule,
} from '../controllers/commuteScheduleController.js';
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
    getCommuteSchedule,
);

router.get(
    '/:id',
    [
        param('id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID must be a number'),

        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getCommuteScheduleById,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('fareDetailId')
            .isInt({ min: 1 })
            .withMessage('Fare detail ID must be a number'),
        body('startTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('endTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('End time must be a time'),
        validateRequest,
    ],
    createCommuteSchedule,
);

router.put(
    '/:id',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('fareDetailId')
            .isInt({ min: 1 })
            .withMessage('Fare detail ID must be a number'),
        body('startTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('endTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('End time must be a time'),
        validateRequest,
    ],
    updateCommuteSchedule,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteCommuteSchedule,
);

export default router;
