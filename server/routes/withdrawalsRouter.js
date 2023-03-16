const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const { getWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:account_id',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getWithdrawals);
router.post('/',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    createWithdrawal);
router.put('/:id',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    updateWithdrawal);
router.delete('/:id',
    [
        param("id").isNumeric().withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteWithdrawal);

module.exports = router;