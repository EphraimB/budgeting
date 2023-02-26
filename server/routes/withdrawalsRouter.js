const express = require('express');
const router = express.Router();
const { getWithdrawals, getWithdrawal, createWithdrawal, updateWithdrawal, deleteWithdrawal } = require('../queries.js');

router.get('/', getWithdrawals);
router.get('/:id', getWithdrawal);
router.post('/', createWithdrawal);
router.put('/:id', updateWithdrawal);
router.delete('/:id', deleteWithdrawal);

module.exports = router;