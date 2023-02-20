const express = require('express');
const router = express.Router();
const { createAccount, updateAccount } = require('../queries.js');

router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;