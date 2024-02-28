import express, { type Router } from 'express';
import { param, query, body } from 'express-validator';
import {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
} from '../controllers/accountsController.js';
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
    ],
    getAccounts,
);

/**
 * @openapi
 * /:
 *   post:
 *     description: Create a new account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns the newly created account.
 */
router.post(
    '/',
    [
        body('name').isString().withMessage('Name must be a string'),
        validateRequest,
    ],
    createAccount,
);

/**
 * @openapi
 * /:
 *   put:
 *     description: Update an account.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns the updated account.
 */
router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('name').isString().withMessage('Name must be a string'),
        validateRequest,
    ],
    updateAccount,
);

/**
 * @openapi
 * /:
 *   delete:
 *     description: Delete an account.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the deleted account.
 */
router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteAccount,
);

export default router;
