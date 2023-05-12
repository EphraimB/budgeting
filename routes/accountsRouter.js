import express from 'express';
import { param, query, body } from 'express-validator';
const router = express.Router();
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../queries.js';
import validateRequest from '../validateRequest.js';

router.get('/',
    [
        query("id").optional().isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    getAccounts);
router.post('/',
    [
        body("name").isString().withMessage("Name must be a string"),
        body("balance").isNumeric().withMessage("Balance must be a number"),
        body("type").isInt().withMessage("Type must be a number"),
        validateRequest,
    ],
    createAccount);
router.put('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        body("name").isString().withMessage("Name must be a string"),
        body("balance").isNumeric().withMessage("Balance must be a number"),
        body("type").isInt().withMessage("Type must be a number"),
        validateRequest,
    ],
    updateAccount);
router.delete('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteAccount);

export default router;