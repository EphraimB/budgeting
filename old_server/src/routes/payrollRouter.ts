import express, { type Router } from 'express';
import { query } from 'express-validator';
import { getPayrolls } from '../controllers/payrollsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('job_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrolls,
);

export default router;
