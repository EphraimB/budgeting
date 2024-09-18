import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    getLoansById,
} from '../controllers/loansController.js';
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
    getLoans,
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
    getLoansById,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('planAmount')
            .isNumeric()
            .withMessage('Planned amount must be a number'),
        body('recipient').isString().withMessage('Recipient must be a string'),
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
        body('interestRate')
            .isNumeric()
            .withMessage('Interest rate must be a number'),
        body('interestFrequencyType')
            .isInt({ min: 0, max: 3 })
            .withMessage(
                'Interest frequency type must be a number between 0 and 3',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        validateRequest,
    ],
    createLoan,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('planAmount')
            .isNumeric()
            .withMessage('Planned amount must be a number'),
        body('recipient').isString().withMessage('Recipient must be a string'),
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
        body('interestRate')
            .isNumeric()
            .withMessage('Interest rate must be a number'),
        body('interestFrequencyType')
            .isInt({ min: 0, max: 3 })
            .withMessage(
                'Interest frequency type must be a number between 0 and 3',
            ),
        body('beginDate')
            .isISO8601()
            .withMessage('Begin date must be a datetime'),
        validateRequest,
    ],
    updateLoan,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteLoan,
);

export default router;
