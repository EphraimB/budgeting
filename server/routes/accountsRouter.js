const express = require('express');
const { param, query, body } = require('express-validator');
const router = express.Router();
const { getAccounts, createAccount, updateAccount, deleteAccount } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/',
    [
        query("id").optional().isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    getAccounts);
router.post('/',
    [
        body("name").isString().withMessage("Name must be a string"),
        body("balance").isNumeric().withMessage("Balance must be a number"),
        body("type").isString().withMessage("Type must be a string"),
        validateRequest,
    ],
    createAccount);
router.put('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        body("name").isString().withMessage("Name must be a string"),
        body("balance").isNumeric().withMessage("Balance must be a number"),
        body("type").isString().withMessage("Type must be a string"),
        validateRequest,
    ],
    updateAccount);
router.delete('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteAccount);

module.exports = router;