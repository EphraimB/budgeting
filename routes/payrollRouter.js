const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getPayrolls, getPayrollTaxes, createPayrollTax, updatePayrollTax, deletePayrollTax, getPayrollDates, createPayrollDate, updatePayrollDate, deletePayrollDate, getEmployee } = require('../queries.js');
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

router.post('/taxes/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        body('applies_to').isString().withMessage('Applies_to must be a string'),
        validateRequest,
    ],
    createPayrollTax);

router.put('/taxes/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        body('applies_to').isString().withMessage('Applies_to must be a string'),
        validateRequest,
    ],
    updatePayrollTax);

router.delete('/taxes/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollTax);

router.get('/dates/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrollDates);

router.post('/dates/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body("start_day").isInt({ min: 1, max: 31 }).withMessage("Start day must be a number between 1 and 31"),
        body("end_day").isInt({ min: 1, max: 31 }).withMessage("End day must be a number between 1 and 31"),
        validateRequest,
    ],
    createPayrollDate);

router.put('/dates/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body("start_day").isInt({ min: 1, max: 31 }).withMessage("Start day must be a number between 1 and 31"),
        body("end_day").isInt({ min: 1, max: 31 }).withMessage("End day must be a number between 1 and 31"),
        validateRequest,
    ],
    updatePayrollDate);

router.delete('/dates/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollDate);

router.get('/employee/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    getEmployee);

module.exports = router;