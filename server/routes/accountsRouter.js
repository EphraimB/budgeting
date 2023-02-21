const express = require('express');
const router = express.Router();
const { getAccounts, getAccount, createAccount, updateAccount, deleteAccount } = require('../queries.js');

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;