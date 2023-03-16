const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const { getWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal } = require('../queries.js');

router.get('/:account_id',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number')
    ],
    getWithdrawals);
router.post('/',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string")
    ],
    createWithdrawal);
router.put('/:id',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string")
    ],
    updateWithdrawal);
router.delete('/:id', deleteWithdrawal);

module.exports = router;