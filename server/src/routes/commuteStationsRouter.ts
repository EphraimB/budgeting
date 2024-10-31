import express, { type Router } from 'express';
import { param, body } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';
import {
    createStation,
    deleteStation,
    getStationById,
    getStations,
    updateStation,
} from '../../src/controllers/commuteStationsController.js';

const router: Router = express.Router();

router.get('/', getStations);

router.get(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getStationById,
);

router.post(
    '/',
    [
        body('commuteSystemId')
            .isInt({ min: 1 })
            .withMessage('Commute system ID must be a number'),
        body('fromStation')
            .isString()
            .withMessage('From station must be a string'),
        body('toStation').isString().withMessage('To station must be a string'),
        body('tripDuration')
            .isInt({ min: 1 })
            .withMessage('Trip duration must be an integer'),
        validateRequest,
    ],
    createStation,
);

router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        body('commuteSystemId')
            .isInt({ min: 1 })
            .withMessage('Commute system ID must be a number'),
        body('fromStation')
            .isString()
            .withMessage('From station must be a string'),
        body('toStation').isString().withMessage('To station must be a string'),
        body('tripDuration')
            .isInt({ min: 1 })
            .withMessage('Trip duration must be an integer'),
        validateRequest,
    ],
    updateStation,
);

router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    deleteStation,
);

export default router;
