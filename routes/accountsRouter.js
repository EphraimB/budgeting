import express from 'express';
import { param, query, body } from 'express-validator';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accountsController.js';
import validateRequest from '../utils/validateRequest.js';

const router = express.Router();

router.get('/',
    [
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest
    ],
    getAccounts);

router.post('/',
    [
        body('name').isString().withMessage('Name must be a string'),
        body('balance').isNumeric().withMessage('Balance must be a number'),
        body('type').isInt().withMessage('Type must be a number'),
        validateRequest
    ],
    createAccount);

router.put('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        body('balance').isNumeric().withMessage('Balance must be a number'),
        body('type').isInt().withMessage('Type must be a number'),
        validateRequest
    ],
    updateAccount);

router.delete('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest
    ],
    deleteAccount);

export default router;
