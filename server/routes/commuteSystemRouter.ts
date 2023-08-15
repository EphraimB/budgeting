import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getCommuteSystem,
    createCommuteSystem,
    deleteCommuteSystem,
    updateCommuteSystem,
} from '../controllers/commuteSystemController.js';
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
    getCommuteSystem,
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
        body('timestamp').isString().withMessage('Timestamp must be a string'),
        validateRequest,
    ],
    createCommuteSystem,
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
        body('timestamp').isString().withMessage('Timestamp must be a string'),
        validateRequest,
    ],
    updateCommuteSystem,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteCommuteSystem,
);

export default router;
