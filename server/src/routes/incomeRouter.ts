import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
    getIncomeById,
} from '../controllers/incomeController.js';
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
    getIncome,
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
    getIncomeById,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('taxId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequencyType')
            .optional()
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequencyTypeVariable')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Frequency variable must be a number'),
        body('frequencyDayOfWeek')
            .optional()
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Frequency day of week must be a number between 0 and 6',
            ),
        body('frequencyWeekOfMonth')
            .optional()
            .isInt({ min: 0, max: 4 })
            .withMessage(
                'Frequency week of month must be a number between 0 and 4',
            ),
        body('frequencyDayOfMonth')
            .optional()
            .isInt({ min: 0, max: 30 })
            .withMessage(
                'Frequency day of month must be a number between 0 and 30',
            ),
        body('frequencyMonthOfYear')
            .optional()
            .isInt({ min: 0, max: 11 })
            .withMessage(
                'Frequency month of year must be a number between 0 and 11',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        body('endDate')
            .optional()
            .isISO8601()
            .withMessage('End date must be a datetime'),
        validateRequest,
    ],
    createIncome,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('taxId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Tax ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('title').isString().withMessage('Title must be a string'),
        body('description')
            .isString()
            .withMessage('Description must be a string'),
        body('frequencyType')
            .optional()
            .isInt({ min: 0, max: 3 })
            .withMessage('Frequency type must be a number between 0 and 3'),
        body('frequencyTypeVariable')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Frequency variable must be a number'),
        body('frequencyDayOfWeek')
            .optional()
            .isInt({ min: 0, max: 6 })
            .withMessage(
                'Frequency day of week must be a number between 0 and 6',
            ),
        body('frequencyWeekOfMonth')
            .optional()
            .isInt({ min: 0, max: 4 })
            .withMessage(
                'Frequency week of month must be a number between 0 and 4',
            ),
        body('frequencyDayOfMonth')
            .optional()
            .isInt({ min: 0, max: 30 })
            .withMessage(
                'Frequency day of month must be a number between 0 and 30',
            ),
        body('frequencyMonthOfYear')
            .optional()
            .isInt({ min: 0, max: 11 })
            .withMessage(
                'Frequency month of year must be a number between 0 and 11',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        body('endDate')
            .optional()
            .isISO8601()
            .withMessage('End date must be a datetime'),
        validateRequest,
    ],
    updateIncome,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteIncome,
);

export default router;
