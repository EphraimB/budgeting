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
        query('account_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
    ],
    getFareDetails,
);

router.post(
    '/',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('commute_system_id')
            .isInt({ min: 1 })
            .withMessage('Commute System ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare_amount')
            .isFloat()
            .withMessage('Fare amount must be a number'),
        body('begin_in_effect_day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Begin in effect day of week must be a number between 0 and 6',
            ),
        body('begin_in_effect_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid time')
            .withMessage('Invalid time'),
        body('end_in_effect_day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'End in effect day of week must be a number between 0 and 6',
            ),
        body('end_in_effect_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid time'),
        validateRequest,
    ],
    createFareDetail,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('commute_system_id')
            .isInt({ min: 1 })
            .withMessage('Commute System ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare_amount')
            .isFloat()
            .withMessage('Fare amount must be a number'),
        body('begin_in_effect_day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Begin in effect day of week must be a number between 0 and 6',
            ),
        body('begin_in_effect_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid time')
            .withMessage('Invalid time'),
        body('end_in_effect_day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'End in effect day of week must be a number between 0 and 6',
            ),
        body('end_in_effect_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Invalid time'),
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
