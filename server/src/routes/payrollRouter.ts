import express, { type Router } from 'express';
import { param } from 'express-validator';
import {
    getPayrolls,
    getPayrollsByJobId,
} from '../controllers/payrollsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get('/', getPayrolls);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollsByJobId,
);

export default router;
