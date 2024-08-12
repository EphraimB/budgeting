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
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
    ],
    getCommuteHistory,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fareAmount')
            .isFloat({ min: 0 })
            .withMessage('Fare amount must be a number'),
        body('commuteSystem')
            .isString()
            .withMessage('Commute system must be a string'),
        body('fareType').isString().withMessage('Fare type must be a string'),
        body('timestamp').isString().withMessage('Timestamp must be a string'),
        validateRequest,
    ],
    createCommuteHistory,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fareAmount')
            .isFloat({ min: 0 })
            .withMessage('Fare amount must be a number'),
        body('commuteSystem')
            .isString()
            .withMessage('Commute system must be a string'),
        body('fareType').isString().withMessage('Fare type must be a string'),
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
