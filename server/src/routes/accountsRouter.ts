import express, { type Router } from 'express';
import { param, query, body } from 'express-validator';
import {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountsById,
} from '../controllers/accountsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get('/', getAccounts);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getAccountsById,
);

router.post(
    '/',
    [
        body('name').isString().withMessage('Name must be a string'),
        validateRequest,
    ],
    createAccount,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        validateRequest,
    ],
    updateAccount,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteAccount,
);

export default router;
