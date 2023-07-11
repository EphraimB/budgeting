import express, { Request, Response, Router } from 'express';
import { query, param, body } from 'express-validator';
import { getWishlists, createWishlist, updateWishlist, deleteWishlist } from '../controllers/wishlistsController.js';
import validateRequest from '../utils/validateRequest.js';
import generateTransactionsUntilWishlist from '../generation/generateTransactionsUntilWishlist.js';
import { getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount } from '../middleware/middleware.js';

const router: Router = express.Router();

router.get('/',
    [
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        query('account_id').optional().isInt({ min: 1 }).withMessage('Account ID must be a number'),
        validateRequest
    ],
    getCurrentBalance, getTransactionsByAccount, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount, generateTransactionsUntilWishlist, getWishlists, (request: Request, response: Response) => {
        response.json({ account_id: parseInt(request.query.account_id as string), currentBalance: request.currentBalance, transactions: request.transactions });
    });

router.post('/',
    [
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description').isString().withMessage('Description must be a string'),
        body('priority').isInt().withMessage('Priority must be a number'),
        validateRequest
    ],
    createWishlist);

router.put('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description').isString().withMessage('Description must be a string'),
        body('priority').isInt().withMessage('Priority must be a number'),
        validateRequest
    ],
    updateWishlist);

router.delete('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest
    ],
    deleteWishlist);

export default router;
