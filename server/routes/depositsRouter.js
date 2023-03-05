const express = require('express');
const router = express.Router();
const { getDeposits, getDeposit, createDeposit, updateDeposit, deleteDeposit } = require('../queries.js');

router.get('/:accountId', getDeposits);
router.get('/:accountId/:id', getDeposit);
router.post('/', createDeposit);
router.put('/:id', updateDeposit);
router.delete('/:id', deleteDeposit);

module.exports = router;