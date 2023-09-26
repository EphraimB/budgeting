import express, { type Router } from "express";
import { param, query, body } from "express-validator";
import {
  createCronJob,
  getCronJobs,
} from "../controllers/cronJobController.js";
import validateRequest from "../utils/validateRequest.js";

const router: Router = express.Router();

router.get(
  "/",
  [
    query("unique_id").optional().isString().withMessage("ID must be a string"),
    validateRequest,
  ],
  getCronJobs
);

router.post(
  "/",
  [
    body("schedule")
      .isString()
      .withMessage("Schedule must be a cron expression"),
    body("command").isString().withMessage("Command must be a string"),
    body("description").isString().withMessage("Description must be a string"),
    validateRequest,
  ],
  createCronJob
);

// router.put(
//     '/:id',
//     [
//         param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
//         body('name').isString().withMessage('Name must be a string'),
//         body('balance').isNumeric().withMessage('Balance must be a number'),
//         body('type').isInt().withMessage('Type must be a number'),
//         validateRequest,
//     ],
//     updateAccount,
// );

// router.delete(
//     '/:id',
//     [
//         param('id').isInt({ min: 1 }).withMessage('ID must be a number'),
//         validateRequest,
//     ],
//     deleteAccount,
// );

export default router;
