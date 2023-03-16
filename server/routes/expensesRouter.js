const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:account_id',
    [
        param('account_id').isInt({ min: 1 }).withMessage('Account ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getExpenses);
router.post('/',
    [
        body("account_id").isInt({ min: 1 }).withMessage("Account ID must be a number"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        body("frequency_type").optional().isInt({ min: 0, max: 3 }).withMessage("Frequency type must be a number between 0 and 3"),
        body("frequency_type_variable").optional().isInt({ min: 1 }).withMessage("Frequency variable must be a number"),
        body("frequency_day_of_week").optional().isInt({ min: 0, max: 6 }).withMessage("Frequency day of week must be a number between 0 and 6"),
        body("frequency_week_of_month").optional().isInt({ min: 0, max: 4 }).withMessage("Frequency week of month must be a number between 0 and 4"),
        body("frequency_day_of_month").optional().isInt({ min: 0, max: 30 }).withMessage("Frequency day of month must be a number between 0 and 30"),
        body("frequency_month_of_year").optional().isInt({ min: 0, max: 11 }).withMessage("Frequency month of year must be a number between 0 and 11"),
        body("begin_date").isDate().withMessage("Begin date must be a date"),
        validateRequest,
    ],
    createExpense);
router.put('/:id',
    [
        body("account_id").isInt({ min: 1 }).withMessage("Account ID must be a number"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        body("frequency_type").optional().isInt({ min: 0, max: 3 }).withMessage("Frequency type must be a number between 0 and 3"),
        body("frequency_type_variable").optional().isInt({ min: 1 }).withMessage("Frequency variable must be a number"),
        body("frequency_day_of_week").optional().isInt({ min: 0, max: 6 }).withMessage("Frequency day of week must be a number between 0 and 6"),
        body("frequency_week_of_month").optional().isInt({ min: 0, max: 4 }).withMessage("Frequency week of month must be a number between 0 and 4"),
        body("frequency_day_of_month").optional().isInt({ min: 0, max: 30 }).withMessage("Frequency day of month must be a number between 0 and 30"),
        body("frequency_month_of_year").optional().isInt({ min: 0, max: 11 }).withMessage("Frequency month of year must be a number between 0 and 11"),
        body("begin_date").isDate().withMessage("Begin date must be a date"),
        body("end_date").optional().isDate().withMessage("End date must be a date"),
        validateRequest,
    ], updateExpense);
router.delete('/:id',
    [
        param("id").isNumeric().withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteExpense);

module.exports = router;