import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    createWishlistCron,
    updateWishlistCron,
} from '../controllers/wishlistsController.js';
import validateRequest from '../utils/validateRequest.js';
import generateTransactions from '../generation/generateTransactions.js';
import {
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
} from '../middleware/middleware.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID must be an integer'),
        query('account_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be an integer'),
        validateRequest,
    ],
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    getWishlists,
);

router.post(
    '/',
    [
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('tax_id')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('priority').isInt().withMessage('Priority must be a number'),
        validateRequest,
    ],
    createWishlist,
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    createWishlistCron,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('tax_id')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('priority').isInt().withMessage('Priority must be a number'),
        validateRequest,
    ],
    updateWishlist,
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getIncomeByAccount,
    getExpensesByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    updateWishlistCron,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteWishlist,
);

export default router;
