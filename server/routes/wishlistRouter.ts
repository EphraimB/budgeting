import express, { Request, Response, NextFunction, Router } from 'express';
import { query, param, body } from 'express-validator';
import { getWishlists, createWishlist, updateWishlist, deleteWishlist } from '../controllers/wishlistsController.js';
import validateRequest from '../utils/validateRequest.js';
import generateTransactionsUntilWishlist from '../generation/generateTransactionsUntilWishlist.js';
import { getCurrentBalance, getTransactionsByAccount, getTransactionsForAllAccounts, getExpensesByAccount, getLoansByAccount, getPayrollsMiddleware, getTransfersByAccount, getWishlistsByAccount } from '../middleware/middleware.js';

const router: Router = express.Router();

const handleWishlistsRequest = async (request: Request, response: Response, next: NextFunction) => {
    const accountId = request.query.account_id as string | undefined;

    if (accountId !== undefined) {
        // If account_id is provided, process wishlists for that account
        await Promise.all([
            getCurrentBalance,
            getTransactionsByAccount,
            getExpensesByAccount,
            getLoansByAccount,
            getPayrollsMiddleware,
            getTransfersByAccount,
            getWishlistsByAccount,
            generateTransactionsUntilWishlist
        ].map(func => func(request, response, next)));
    } else {
        // If account_id is not provided, process wishlists for all accounts
        await Promise.all([
            getTransactionsForAllAccounts,
            generateTransactionsUntilWishlist
        ].map(func => func(request, response, next)));

        // Retrieve wishlists for all accounts
        await getWishlistsByAccount(request, response, next);
    }

    next();
};

router.get('/', [
    query('id').optional().isInt({ min: 1 }).withMessage('ID must be an integer'),
    query('account_id').optional().isInt({ min: 1 }).withMessage('Account ID must be an integer'),
    validateRequest,
    handleWishlistsRequest,
    getWishlists
]);

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
