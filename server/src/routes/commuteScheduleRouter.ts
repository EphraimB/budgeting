import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    createCommuteSchedule,
    createCommuteScheduleReturnObject,
    deleteCommuteSchedule,
    deleteCommuteScheduleReturnObject,
    getCommuteSchedule,
    updateCommuteSchedule,
    updateCommuteScheduleReturnObject,
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
    getCommuteExpensesByAccount,
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
        query('accountId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
    ],
    getCommuteSchedule,
);

router.post(
    '/',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('fareDetailId')
            .isInt({ min: 1 })
            .withMessage('Fare detail ID must be a number'),
        body('startTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('endTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('End time must be a time'),
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
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    updateWishlistCron,
    createCommuteScheduleReturnObject,
);

router.put(
    '/:id',
    [
        body('accountId')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('dayOfWeek')
            .isInt({ min: 0, max: 6 })
            .withMessage('Day of week must be a number between 0 and 6'),
        body('fareDetailId')
            .isInt({ min: 1 })
            .withMessage('Fare detail ID must be a number'),
        body('startTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('Start time must be a time'),
        body('endTime')
            .isTime({ hourFormat: 'hour24', mode: 'withSeconds' })
            .withMessage('End time must be a time'),
        validateRequest,
    ],
    updateCommuteSchedule,
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getExpensesByAccount,
    getIncomeByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    updateWishlistCron,
    updateCommuteScheduleReturnObject,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteCommuteSchedule,
    setQueries,
    getCurrentBalance,
    getTransactionsByAccount,
    getExpensesByAccount,
    getIncomeByAccount,
    getLoansByAccount,
    getPayrollsMiddleware,
    getTransfersByAccount,
    getCommuteExpensesByAccount,
    getWishlistsByAccount,
    generateTransactions,
    updateWishlistCron,
    deleteCommuteScheduleReturnObject,
);

export default router;
