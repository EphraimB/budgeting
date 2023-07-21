import express, { Router } from 'express';
import { query, param, body } from 'express-validator';
import { getEmployee, createEmployee, updateEmployee, updateEmployeeReturnObject, deleteEmployee } from '../controllers/employeesController.js';
import validateRequest from '../utils/validateRequest.js';
import generateTransactions from '../generation/generateTransactions.js';
import { setQueries, getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, updateWishlistCron } from '../middleware/middleware.js';

const router: Router = express.Router();

router.get('/',
    [
        query('employee_id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest
    ],
    getEmployee);

router.post('/',
    [
        body('name').isString().withMessage('Name must be a string'),
        body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a number'),
        body('regular_hours').isInt({ min: 0 }).withMessage('Regular hours must be a number'),
        body('vacation_days').isInt({ min: 0 }).withMessage('Vacation days must be a number'),
        body('sick_days').isFloat({ min: 0 }).withMessage('Sick days must be a number'),
        body('work_schedule').isString().withMessage('Work schedule must be a string'),
        validateRequest
    ],
    createEmployee);

router.put('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a number'),
        body('regular_hours').isInt({ min: 0 }).withMessage('Regular hours must be a number'),
        body('vacation_days').isInt({ min: 0 }).withMessage('Vacation days must be a number'),
        body('sick_days').isFloat({ min: 0 }).withMessage('Sick days must be a number'),
        body('work_schedule').isString().withMessage('Work schedule must be a string'),
        validateRequest
    ], updateEmployee, setQueries, getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, generateTransactions, updateWishlistCron, updateEmployeeReturnObject);

router.delete('/:employee_id',
    [
        param('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest
    ],
    deleteEmployee);

export default router;
