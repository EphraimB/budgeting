import express from 'express';
import { query, param, body } from 'express-validator';
const router = express.Router();
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionHistoryController.js';
import validateRequest from '../validateRequest.js';

router.get('/',
    [
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getTransactions);
router.post('/',
    [
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    createTransaction);
router.put('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("account_id").isNumeric().withMessage("Account ID must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    updateTransaction);
router.delete('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteTransaction);

export default router;