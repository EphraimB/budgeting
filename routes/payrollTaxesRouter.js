import express from 'express';
import { query, param, body } from 'express-validator';
const router = express.Router();
import { getPayrollTaxes, createPayrollTax, updatePayrollTax, deletePayrollTax } from '../queries.js';
import validateRequest from '../validateRequest.js';

router.get('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrollTaxes);

router.post('/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        validateRequest,
    ],
    createPayrollTax);

router.put('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        validateRequest,
    ],
    updatePayrollTax);

router.delete('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollTax);

export default router;