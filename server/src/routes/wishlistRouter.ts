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
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be an integer'),
        body('taxId')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('priority').isInt().withMessage('Priority must be a number'),
        body('urlLink').isURL().withMessage('Url link must be a url'),
        body('dateAvailable')
            .optional({ nullable: true })
            .isISO8601()
            .withMessage('Date available must be a datetime'),
        validateRequest,
    ],
    createWishlist,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be an integer'),
        body('taxId')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('priority').isInt().withMessage('Priority must be a number'),
        body('urlLink').isURL().withMessage('Url link must be a url'),
        body('dateAvailable')
            .optional({ nullable: true })
            .isISO8601()
            .withMessage('Date available must be a datetime'),
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
