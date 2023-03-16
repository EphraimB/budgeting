const express = require('express');
const { query, body } = require('express-validator');
const router = express.Router();
const { getAccounts, createAccount, updateAccount, deleteAccount } = require('../queries.js');

router.get('/',
    [
        query("id").isNumeric().withMessage("ID must be a number"),
    ],
    getAccounts);
router.post('/',
    [
        body("name").isString().withMessage("Name must be a string"),
        body("balance").isNumeric().withMessage("Balance must be a number"),
        body("type").isString().withMessage("Type must be a string")
    ],
    createAccount);
router.put('/:id',
    [
        path("id").isNumeric().withMessage("ID must be a number"),
        body("name").isString().withMessage("Name must be a string"),
        body("balance").isNumeric().withMessage("Balance must be a number"),
        body("type").isString().withMessage("Type must be a string")
    ],
    updateAccount);
router.delete('/:id',
    [
        path("id").isNumeric().withMessage("ID must be a number"),
    ],
    deleteAccount);

module.exports = router;