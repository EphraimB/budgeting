import express, { type Router } from 'express';
import { query } from 'express-validator';
import { getCommuteOverview } from '../controllers/commuteOverviewController.js';
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
    getCommuteOverview,
);

export default router;
