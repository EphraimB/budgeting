const express = require('express');
const router = express.Router();
const { getWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal } = require('../queries.js');

router.get('/:account_id/:id?', getWithdrawals);
router.post('/', createWithdrawal);
router.put('/:id', updateWithdrawal);
router.delete('/:id', deleteWithdrawal);

module.exports = router;