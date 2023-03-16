const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const { getDeposits, createDeposit, updateDeposit, deleteDeposit } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:account_id',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getDeposits);
router.post('/',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    createDeposit);
router.put('/:id',
    [
        param("id").isNumeric().withMessage("ID must be a number"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    updateDeposit);
router.delete('/:id',
    [
        param("id").isNumeric().withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteDeposit);

module.exports = router;