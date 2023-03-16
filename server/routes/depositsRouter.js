const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const { getDeposits, createDeposit, updateDeposit, deleteDeposit } = require('../queries.js');

router.get('/:account_id/:id?',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number')
    ],
    getDeposits);
router.post('/', createDeposit);
router.put('/:id', updateDeposit);
router.delete('/:id', deleteDeposit);

module.exports = router;