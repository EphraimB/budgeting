const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getPayrollDates, createPayrollDate, updatePayrollDate, deletePayrollDate } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrollDates);

router.post('/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body("start_day").isInt({ min: 1, max: 31 }).withMessage("Start day must be a number between 1 and 31"),
        body("end_day").isInt({ min: 1, max: 31 }).withMessage("End day must be a number between 1 and 31"),
        validateRequest,
    ],
    createPayrollDate);

router.put('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body("start_day").isInt({ min: 1, max: 31 }).withMessage("Start day must be a number between 1 and 31"),
        body("end_day").isInt({ min: 1, max: 31 }).withMessage("End day must be a number between 1 and 31"),
        validateRequest,
    ],
    updatePayrollDate);

router.delete('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollDate);

module.exports = router;