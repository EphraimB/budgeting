const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getPayrolls, getPayrollTaxes, createPayrollTax } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    getPayrolls);

router.get('/taxes/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrollTaxes);

router.post('/taxes/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        body('applies_to').isString().withMessage('Applies_to must be a string'),
        validateRequest,
    ],
    createPayrollTax);

module.exports = router;