import express, { type Router } from 'express';
import { param, body } from 'express-validator';
import {
    getFareDetails,
    createFareDetail,
    updateFareDetail,
    deleteFareDetail,
    getFareDetailsById,
} from '../controllers/fareDetailsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get('/', getFareDetails);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getFareDetailsById,
);

router.post(
    '/',
    [
        body('stationId')
            .isInt({ min: 1 })
            .withMessage('Commute System ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare').isFloat().withMessage('Fare must be a number'),
        body('timeslots.*.dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Invalid day of week value. It should be between 0 (Sunday) and 6 (Saturday).',
            ),
        body('timeslots.*.startTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid start time format. It should be HH:MM:SS.'),
        body('timeslots.*.endTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid end time format. It should be HH:MM:SS.'),
        body('duration')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Duration must be be an integer'),
        body('dayStart')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('day start must be an integer'),
        body('alternateFareDetailId')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Alternate fare detail ID must be a number'),
        validateRequest,
    ],
    createFareDetail,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('stationId')
            .isInt({ min: 1 })
            .withMessage('Commute System ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare').isFloat().withMessage('Fare must be a number'),
        body('timeslots.*.dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Invalid day of week value. It should be between 0 (Sunday) and 6 (Saturday).',
            ),
        body('timeslots.*.startTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid start time format. It should be HH:MM:SS.'),
        body('timeslots.*.endTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid end time format. It should be HH:MM:SS.'),
        body('duration')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Duration must be be an integer'),
        body('dayStart')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('day start must be an integer'),
        body('alternateFareDetailId')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Alternate fare detail ID must be a number'),
        validateRequest,
    ],
    updateFareDetail,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteFareDetail,
);

export default router;
