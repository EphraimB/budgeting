const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const { getDeposits, createDeposit, updateDeposit, deleteDeposit } = require('../queries.js');

router.get('/:account_id/:id?',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number')
    ],
    getDeposits);
router.post('/',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string")
    ],
    createDeposit);
router.put('/:id',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string")
    ],
    updateDeposit);
router.delete('/:id', deleteDeposit);

module.exports = router;