const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:account_id',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number'),
        query('id').optional().isNumeric().withMessage('ID must be a number'),
        validateRequest,
    ],
    getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;