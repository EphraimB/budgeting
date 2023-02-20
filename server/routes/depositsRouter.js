const express = require('express');
const router = express.Router();
const { createDeposit, updateDeposit, deleteDeposit } = require('../queries.js');

router.post('/', createDeposit);
router.put('/:id', updateDeposit);
router.delete('/:id', deleteDeposit);

module.exports = router;