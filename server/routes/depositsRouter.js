const express = require('express');
const router = express.Router();

router.post('/', createDeposit);
router.put('/:id', updateDeposit);
router.delete('/:id', deleteDeposit);

module.exports = router;