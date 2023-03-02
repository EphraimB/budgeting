const express = require('express');
const router = express.Router();
const { getCurrentBalance} = require('../queries.js');

router.get('/', getCurrentBalance);

module.exports = router;