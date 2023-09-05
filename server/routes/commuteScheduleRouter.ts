import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    createCommuteSchedule,
    createCommuteScheduleReturnObject,
    deleteCommuteSchedule,
    getCommuteSchedule,
    updateCommuteSchedule,
} from '../controllers/commuteScheduleController.js';
import validateRequest from '../utils/validateRequest.js';
import {
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getExpensesByAccount,
    getIncomeByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getWishlistsByAccount,
    updateWishlistCron,
} from '../middleware/middleware.js';
import generateTransactions from '../generation/generateTransactions.js';

const router: Router = express.Router();

router.get(
    '/',
    [
        query('id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID must be a number'),
        validateRequest,
        query('account_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
    ],
    getCommuteSchedule,
);

router.post(
    '/',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('commute_ticket_id')
            .isInt({ min: 1 })
            .withMessage('Commute ticket ID must be a number'),
        body('start_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('duration')
            .isInt({ min: 0 })
            .withMessage('Duration must be a number'),
        validateRequest,
    ],
    createCommuteSchedule,
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getExpensesByAccount,
    getIncomeByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getWishlistsByAccount,
    generateTransactions,
    updateWishlistCron,
    createCommuteScheduleReturnObject,
);

router.put(
    '/:id',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('day_of_week')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('commute_ticket_id')
            .isInt({ min: 1 })
            .withMessage('Commute ticket ID must be a number'),
        body('start_time')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('duration')
            .isInt({ min: 0 })
            .withMessage('Duration must be a number'),
        validateRequest,
    ],
    updateCommuteSchedule,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteCommuteSchedule,
);

export default router;
