import express, { Router } from 'express';
import { query, param, body } from 'express-validator';
import { getPayrollTaxes, createPayrollTax, createPayrollTaxReturnObject, updatePayrollTax, updatePayrollTaxReturnObject, deletePayrollTax } from '../controllers/payrollTaxesController.js';
import validateRequest from '../utils/validateRequest.js';
import generateTransactions from '../generation/generateTransactions.js';
import { setQueries, getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, updateWishlistCron } from '../middleware/middleware.js';

const router: Router = express.Router();

router.get('/',
    [
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        query('employee_id').optional().isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        validateRequest
    ],
    getPayrollTaxes);

router.post('/',
    [
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        validateRequest
    ], createPayrollTax, setQueries, getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, generateTransactions, updateWishlistCron, createPayrollTaxReturnObject);

router.put('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('employee_id').isInt({ min: 1 }).withMessage('Employee ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('rate').isFloat({ min: 0 }).withMessage('Rate must be a number'),
        validateRequest
    ], updatePayrollTax, setQueries, getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, generateTransactions, updateWishlistCron, updatePayrollTaxReturnObject);

router.delete('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest
    ],
    deletePayrollTax);

export default router;
