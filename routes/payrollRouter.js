const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getPayrolls } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrolls);

module.exports = router;