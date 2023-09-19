import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getFareDetails,
    createFareDetail,
    updateFareDetail,
    deleteFareDetail,
} from '../controllers/fareDetailsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID must be a number'),
        validateRequest,
    ],
    getFareDetails,
);

router.post(
    '/',
    [
        body('commute_system_id')
            .isInt({ min: 1 })
            .withMessage('Commute System ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare_amount')
            .isFloat()
            .withMessage('Fare amount must be a number'),
        body('timeslots.*.day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Invalid day of week value. It should be between 0 (Sunday) and 6 (Saturday).',
            ),
        body('timeslots.*.start_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid start time format. It should be HH:MM:SS.'),
        body('timeslots.*.end_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid end time format. It should be HH:MM:SS.'),
        body('timed_pass_duration')
            .optional({ nullable: true })
            .isInt({ min: 1 }),
        body('alternate_fare_detail_id')
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
        body('commute_system_id')
            .isInt({ min: 1 })
            .withMessage('Commute System ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare_amount')
            .isFloat()
            .withMessage('Fare amount must be a number'),
        body('timeslots.*.day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Invalid day of week value. It should be between 0 (Sunday) and 6 (Saturday).',
            ),
        body('timeslots.*.start_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid start time format. It should be HH:MM:SS.'),
        body('timeslots.*.end_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid end time format. It should be HH:MM:SS.'),
        body('timed_pass_duration')
            .optional({ nullable: true })
            .isInt({ min: 1 }),
        body('alternate_fare_detail_id')
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
