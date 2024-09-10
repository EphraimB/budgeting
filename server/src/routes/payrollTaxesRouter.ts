import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getPayrollTaxes,
    createPayrollTax,
    updatePayrollTax,
    deletePayrollTax,
    getPayrollTaxesById,
} from '../controllers/payrollTaxesController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('jobId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollTaxes,
);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        query('jobId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollTaxesById,
);

router.post(
    '/',
    [
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        validateRequest,
    ],
    createPayrollTax,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        validateRequest,
    ],
    updatePayrollTax,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollTax,
);

export default router;
