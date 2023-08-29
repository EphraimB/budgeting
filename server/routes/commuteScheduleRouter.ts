import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    createCommuteSchedule,
    getCommuteSchedule,
} from '../controllers/commuteScheduleController.js';
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
    getCommuteSchedule,
);

router.post(
    '/',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('commute_ticket_id')
            .isInt({ min: 1 })
            .withMessage('Commute ticket ID must be a number'),
        body('start_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('duration')
            .isInt({ min: 0 })
            .withMessage('Duration must be a number'),
        validateRequest,
    ],
    createCommuteSchedule,
);

// router.put(
//     '/:id',
//     [
//         param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
//         body('account_id')
//             .isInt({ min: 1 })
//             .withMessage('Account ID must be a number'),
//         body('name').isString().withMessage('Name must be a string'),
//         body('fare_cap')
//             .optional({ nullable: true })
//             .isFloat({ min: 0 })
//             .withMessage('Fare cap amount must be a number'),
//         body('fare_cap_duration')
//             .optional({ nullable: true })
//             .isInt({ min: 0, max: 3 })
//             .withMessage('Duration must be a number'),
//         validateRequest,
//     ],
//     updateCommuteSystem,
// );

// router.delete(
//     '/:id',
//     [
//         param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
//         validateRequest,
//     ],
//     deleteCommuteSystem,
// );

export default router;
