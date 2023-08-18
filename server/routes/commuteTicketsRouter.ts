import express, { type Router } from 'express';
import { query, param, body } from 'express-validator';
import {
    getCommuteTicket,
    createCommuteTicket,
    updateCommuteTicket,
    deleteCommuteTicket,
} from '../controllers/commuteTicketsController.js';
import validateRequest from '../utils/validateRequest.js';

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
    getCommuteTicket,
);

router.post(
    '/',
    [
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare_detail_id')
            .isInt({ min: 1 })
            .withMessage('Fare detail ID must be a number'),
        body('alternate_ticket_id')
            .isInt({ min: 1 })
            .withMessage('Alternate ticket ID must be a number'),
        validateRequest,
    ],
    createCommuteTicket,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('account_id')
            .isInt({ min: 1 })
            .withMessage('Account ID must be a number'),
        body('fare_detail_id')
            .isInt({ min: 1 })
            .withMessage('Fare detail ID must be a number'),
        body('alternate_ticket_id')
            .isInt({ min: 1 })
            .withMessage('Alternate ticket ID must be a number'),
        validateRequest,
    ],
    updateCommuteTicket,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteCommuteTicket,
);

export default router;