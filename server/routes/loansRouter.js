const express = require('express');
const router = express.Router();
const { getLoans, getLoan, createLoan, updateLoan, deleteLoan } = require('../queries.js');

router.get('/', getLoans);
router.get('/:id', getLoan);
router.post('/', createLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

module.exports = router;