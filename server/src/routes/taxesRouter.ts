import express, { type Router } from 'express';
import { param, body } from 'express-validator';
import {
    getTaxes,
    createTax,
    updateTax,
    deleteTax,
    getTaxesById,
} from '../controllers/taxesController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get('/', getTaxes);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getTaxesById,
);

router.post(
    '/',
    [
        body('rate').isNumeric().withMessage('Rate must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('type').isInt().withMessage('Type must be a integer'),
        validateRequest,
    ],
    createTax,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('rate').isNumeric().withMessage('Rate must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('type').isInt().withMessage('Type must be a integer'),
        validateRequest,
    ],
    updateTax,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteTax,
);

export default router;
