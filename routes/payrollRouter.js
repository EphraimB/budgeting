const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const { getPayrolls } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    getPayrolls);

module.exports = router;