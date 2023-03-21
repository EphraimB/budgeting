const express = require('express');
const generateTransactions = require('../generateTransactions.js');
const router = express.Router();
const { getTransfers } = require('../queries.js');
const { param, query } = require('express-validator');
const validateRequest = require('../validateRequest.js');

router.get('/:account_id',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number'),
        query('id').optional().isNumeric().withMessage('ID must be a number'),
        validateRequest,
    ],
    getTransfers);

module.exports = router;