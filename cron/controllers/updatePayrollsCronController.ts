import { exec } from "child_process";
import { logger } from "../config/winston.js";
import { Request, Response } from "express";

export const updatePayrollsCron = async (req: Request, res: Response) => {
  const { employee_id } = req.body;

  // Define the script command
  const scriptCommand: string = `/scripts/getPayrollsByEmployee.sh ${employee_id}`;

  exec(scriptCommand, (error, stdout, stderr) => {
    if (error) {
      logger.error(`exec error: ${error}`);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to create cron job" });
    }

    logger.info(`Script executed: ${scriptCommand}`);

    return res.status(200).json({
      status: "success",
      message: "Script executed",
    });
  });
};
