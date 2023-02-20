const express = require('express');
const router = express.Router();
const { createWithdrawal, updateWithdrawal, deleteWithdrawal } = require('../queries.js');

router.post('/', createWithdrawal);
router.put('/:id', updateWithdrawal);
router.delete('/:id', deleteWithdrawal);

module.exports = router;