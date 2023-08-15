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
        body('name').isString().withMessage('Name must be a string'),
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare_cap')
            .optional()
            .custom((value) => typeof value === 'number' || value === null)
            .withMessage('Fare cap must be a number or null'),
        body('fare_cap_duration')
            .optional()
            .custom((value) => value === null || Number.isInteger(value))
            .withMessage('Fare cap duration must be an integer or null'),
        validateRequest,
    ],
    createCommuteSystem,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare_cap')
            .optional()
            .custom((value) => typeof value === 'number' || value === null)
            .withMessage('Fare cap must be a number or null'),
        body('fare_cap_duration')
            .optional()
            .custom((value) => value === null || Number.isInteger(value))
            .withMessage('Fare cap duration must be an integer or null'),
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
