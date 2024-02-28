import express, { type Router } from 'express';
import { param, query, body } from 'express-validator';
import {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
} from '../controllers/accountsController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Get all accounts'
    // #swagger.description = 'Get all accounts'

    '/',
    [
        query('id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID must be a number'),
        validateRequest,
    ],
    getAccounts,
);

router.post(
    // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Create an account'
    // #swagger.description = 'Create an account'
    '/',
    [
        body('name').isString().withMessage('Name must be a string'),
        validateRequest,
    ],
    createAccount,
);

router.put(
    // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Update an account'
    // #swagger.description = 'Update an account'
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        validateRequest,
    ],
    updateAccount,
);

router.delete(
    // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Delete an account'
    // #swagger.description = 'Delete an account'
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteAccount,
);

export default router;
