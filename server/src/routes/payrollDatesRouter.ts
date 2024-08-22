import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getPayrollDates,
    createPayrollDate,
    updatePayrollDate,
    deletePayrollDate,
    togglePayrollDate,
    getPayrollDatesById,
} from '../controllers/payrollDatesController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('jobId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollDates,
);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        query('jobId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Job ID must be a number'),
        validateRequest,
    ],
    getPayrollDatesById,
);

router.post(
    '/',
    [
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payrollDay')
            .isInt({ min: 1, max: 31 })
            .withMessage('Payroll day must be a number between 1 and 31'),
        validateRequest,
    ],
    createPayrollDate,
);

router.post(
    '/toggle',
    [
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payrollDay')
            .isInt({ min: 1, max: 31 })
            .withMessage('Payroll day must be a number between 1 and 31'),
        validateRequest,
    ],
    togglePayrollDate,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('jobId').isInt({ min: 1 }).withMessage('Job ID must be a number'),
        body('payrollDay')
            .isInt({ min: 1, max: 31 })
            .withMessage('Payroll day must be a number between 1 and 31'),
        validateRequest,
    ],
    updatePayrollDate,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollDate,
);

export default router;
