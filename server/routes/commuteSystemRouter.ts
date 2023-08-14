import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getCommuteSystem,
    createCommuteSystem,
    updateSystem,
    deleteCommuteSystem,
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
        body('fare_cap')
            .optional()
            .isNumeric()
            .withMessage('Fare cap must be a number'),
        body('fare_cap_duration')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Fare cap duration must be a number'),
        validateRequest,
    ],
    createCommuteSystem,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('fare_cap')
            .optional()
            .isNumeric()
            .withMessage('Fare cap must be a number'),
        body('fare_cap_duration')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Fare cap duration must be a number'),
        validateRequest,
    ],
    updateSystem,
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
