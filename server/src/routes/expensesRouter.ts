import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesById,
} from '../controllers/expensesController.js';
import validateRequest from '../utils/validateRequest.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getExpenses,
);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        validateRequest,
    ],
    getExpensesById,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('taxId')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequency.type')
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequency.typeVariable')
            .isInt({ min: 1 })
            .withMessage('Frequency variable must be a number'),
        body('frequency.dayOfWeek')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Frequency day of week must be a number between 0 and 6',
            ),
        body('frequency.weekOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 4 })
            .withMessage(
                'Frequency week of month must be a number between 0 and 4',
            ),
        body('frequency.dayOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 30 })
            .withMessage(
                'Frequency day of month must be a number between 0 and 30',
            ),
        body('frequency.monthOfYear')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 11 })
            .withMessage(
                'Frequency month of year must be a number between 0 and 11',
            ),
        body('subsidized')
            .isNumeric()
            .withMessage('Subsidized must be a number'),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        body('endDate')
            .optional({ nullable: true })
            .isISO8601()
            .withMessage('End date must be a datetime'),
        validateRequest,
    ],
    createExpense,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('taxId')
            .optional({ nullable: true })
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequency.type')
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequency.typeVariable')
            .isInt({ min: 1 })
            .withMessage('Frequency variable must be a number'),
        body('frequency.dayOfWeek')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Frequency day of week must be a number between 0 and 6',
            ),
        body('frequency.weekOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 4 })
            .withMessage(
                'Frequency week of month must be a number between 0 and 4',
            ),
        body('frequency.dayOfMonth')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 30 })
            .withMessage(
                'Frequency day of month must be a number between 0 and 30',
            ),
        body('frequency.monthOfYear')
            .optional({ nullable: true })
            .isInt({ min: 0, max: 11 })
            .withMessage(
                'Frequency month of year must be a number between 0 and 11',
            ),
        body('subsidized')
            .isNumeric()
            .withMessage('Subsidized must be a number'),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        body('endDate')
            .optional({ nullable: true })
            .isISO8601()
            .withMessage('End date must be a datetime'),
        validateRequest,
    ],
    updateExpense,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteExpense,
);

export default router;
