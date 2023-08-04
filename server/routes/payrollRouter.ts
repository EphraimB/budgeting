import express, { type Router } from "express";
import { query } from "express-validator";
import { getPayrolls } from "../controllers/payrollsController.js";
import validateRequest from "../utils/validateRequest.js";

const router: Router = express.Router();

router.get(
    "/",
    [
        query("employee_id")
            .isInt({ min: 1 })
            .withMessage("Employee ID must be a number"),
        validateRequest,
    ],
    getPayrolls,
);

export default router;
