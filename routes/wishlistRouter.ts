import express, { Router } from 'express';
import { query, param, body } from 'express-validator';
import { getWishlists, createWishlist, updateWishlist, deleteWishlist } from '../controllers/wishlistsController';
import validateRequest from '../utils/validateRequest';

const router: Router = express.Router();

router.get('/',
    [
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        query('account_id').optional().isInt({ min: 1 }).withMessage('Account ID must be a number'),
        validateRequest
    ],
    getWishlists);

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
