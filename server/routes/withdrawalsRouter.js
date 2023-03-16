const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const { getWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal } = require('../queries.js');

router.get('/:account_id',
    [
        param('account_id').isNumeric().withMessage('Account ID must be a number')
    ],
    getWithdrawals);
router.post('/', createWithdrawal);
router.put('/:id', updateWithdrawal);
router.delete('/:id', deleteWithdrawal);

module.exports = router;