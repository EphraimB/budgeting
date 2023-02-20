const express = require('express');
const router = express.Router();

router.post('/', createWithdrawal);
router.put('/:id', updateWithdrawal);
router.delete('/:id', deleteWithdrawal);

module.exports = router;