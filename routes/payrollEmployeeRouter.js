const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/',
    [
        query('id').optional().isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    getEmployee);

router.post('/',
    [
        body('name').isString().withMessage('Name must be a string'),
        body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a number'),
        body('regular_hours').isInt({ min: 0 }).withMessage('Regular hours must be a number'),
        body('vacation_days').isInt({ min: 0 }).withMessage('Vacation days must be a number'),
        body('sick_days').isFloat({ min: 0 }).withMessage('Sick days must be a number'),
        body('work_schedule').isString().withMessage('Work schedule must be a string'),
        validateRequest,
    ],
    createEmployee);

router.put('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a number'),
        body('regular_hours').isInt({ min: 0 }).withMessage('Regular hours must be a number'),
        body('vacation_days').isInt({ min: 0 }).withMessage('Vacation days must be a number'),
        body('sick_days').isFloat({ min: 0 }).withMessage('Sick days must be a number'),
        body('work_schedule').isString().withMessage('Work schedule must be a string'),
        validateRequest,
    ],
    updateEmployee);

router.delete('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    deleteEmployee);

module.exports = router;