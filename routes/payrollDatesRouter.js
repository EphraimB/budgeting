import express from 'express';
import { query, param, body } from 'express-validator';
const router = express.Router();
import { getPayrollDates, createPayrollDate, updatePayrollDate, deletePayrollDate } from '../queries.js';
import validateRequest from '../validateRequest.js';

router.get('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getPayrollDates);

router.post('/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body("start_day").isInt({ min: 1, max: 31 }).withMessage("Start day must be a number between 1 and 31"),
        body("end_day").isInt({ min: 1, max: 31 }).withMessage("End day must be a number between 1 and 31"),
        validateRequest,
    ],
    createPayrollDate);

router.put('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body("start_day").isInt({ min: 1, max: 31 }).withMessage("Start day must be a number between 1 and 31"),
        body("end_day").isInt({ min: 1, max: 31 }).withMessage("End day must be a number between 1 and 31"),
        validateRequest,
    ],
    updatePayrollDate);

router.delete('/',
    [
        query('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        query('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deletePayrollDate);

export default router;