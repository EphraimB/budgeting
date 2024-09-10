import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getCommuteHistory,
    createCommuteHistory,
    deleteCommuteHistory,
    updateCommuteHistory,
    getCommuteHistoryById,
} from '../controllers/commuteHistoryController.js';
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
    getCommuteHistory,
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
    getCommuteHistoryById,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare')
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
        body('fare')
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
