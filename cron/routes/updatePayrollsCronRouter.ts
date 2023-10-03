import express, { type Router } from "express";
import { body } from "express-validator";
import { updatePayrollsCron } from "../controllers/updatePayrollsCronController.js";
import validateRequest from "../utils/validateRequest.js";

const router: Router = express.Router();

router.post(
  "/",
  [
    body("employee_id")
      .isInt({ min: 1 })
      .withMessage("Employee ID must be a integer"),
    validateRequest,
  ],
  updatePayrollsCron
);

export default router;
