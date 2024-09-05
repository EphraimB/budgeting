import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    getWishlistsById,
} from '../controllers/wishlistsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be an integer'),
        validateRequest,
    ],
    getWishlists,
);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be an integer'),
        validateRequest,
    ],
    getWishlistsById,
);

router.post(
    '/',
    [
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('taxId')
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
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('taxId')
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
