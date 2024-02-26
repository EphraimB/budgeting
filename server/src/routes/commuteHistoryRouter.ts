import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getCommuteHistory,
    createCommuteHistory,
    deleteCommuteHistory,
    updateCommuteHistory,
} from '../controllers/commuteHistoryController.js';
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
    getCommuteHistory,
);

router.post(
    '/',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare_amount')
            .isFloat({ min: 0 })
            .withMessage('Fare amount must be a number'),
        body('commute_system')
            .isString()
            .withMessage('Commute system must be a string'),
        body('fare_type').isString().withMessage('Fare type must be a string'),
        body('timestamp').isString().withMessage('Timestamp must be a string'),
        validateRequest,
    ],
    createCommuteHistory,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare_amount')
            .isFloat({ min: 0 })
            .withMessage('Fare amount must be a number'),
        body('commute_system')
            .isString()
            .withMessage('Commute system must be a string'),
        body('fare_type').isString().withMessage('Fare type must be a string'),
        body('timestamp').isString().withMessage('Timestamp must be a string'),
        validateRequest,
    ],
    updateCommuteHistory,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteCommuteHistory,
);

export default router;
