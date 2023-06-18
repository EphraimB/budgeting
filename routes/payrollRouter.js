import express from 'express';
import { query } from 'express-validator';
const router = express.Router();
import { getPayrolls } from '../controllers/payrollsController.js';
import validateRequest from '../utils/validateRequest.js';

router.get('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest,
    ],
    getPayrolls);

export default router;