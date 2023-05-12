import express from 'express';
import { query } from 'express-validator';
const router = express.Router();
import { getPayrolls } from '../queries.js';
import validateRequest from '../validateRequest.js';

router.get('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    getPayrolls);

export default router;