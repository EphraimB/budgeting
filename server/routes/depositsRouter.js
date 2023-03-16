const express = require('express');
const router = express.Router();
const { getDeposits, createDeposit, updateDeposit, deleteDeposit } = require('../queries.js');

router.get('/', getDeposits);
router.get('/:id', getDeposits);
router.post('/', createDeposit);
router.put('/:id', updateDeposit);
router.delete('/:id', deleteDeposit);

module.exports = router;