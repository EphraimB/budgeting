const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getPayrollTaxes, createPayrollTax, updatePayrollTax, deletePayrollTax } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrollTaxes);

router.post('/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        body('applies_to').isString().withMessage('Applies_to must be a string'),
        validateRequest,
    ],
    createPayrollTax);

router.put('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        body('applies_to').isString().withMessage('Applies_to must be a string'),
        validateRequest,
    ],
    updatePayrollTax);

router.delete('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollTax);

module.exports = router;