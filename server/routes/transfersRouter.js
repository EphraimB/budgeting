const express = require('express');
const generateTransactions = require('../generateTransactions.js');
const router = express.Router();
const { getTransfers } = require('../queries.js');
const { query } = require('express-validator');
const validateRequest = require('../validateRequest.js');



module.exports = router;