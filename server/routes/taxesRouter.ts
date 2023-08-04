import express, { type Router } from "express";
import { query, param, body } from "express-validator";
import {
    getTaxes,
    createTax,
    updateTax,
    deleteTax,
} from "../controllers/taxesController.js";
import validateRequest from "../utils/validateRequest.js";

const router: Router = express.Router();

router.get(
    "/",
    [
        query("id").optional().isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    getTaxes,
);

router.post(
    "/",
    [
        body("rate").isNumeric().withMessage("Rate must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    createTax,
);

router.put(
    "/:id",
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        body("rate").isNumeric().withMessage("Rate must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    updateTax,
);

router.delete(
    "/:id",
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteTax,
);

export default router;
