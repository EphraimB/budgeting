import { exec } from "child_process";
import { logger } from "../config/winston.js";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "../utils/helperFunctions.js";

/**
 *
 * @param req - Express request object
 * @param res - Express response object
 * Sends a GET request to the server to retrieve all or a single cron job
 */
export const getCronJobs = async (req: Request, res: Response) => {
  const { unique_id } = req.query;

  try {
    exec("crontab -l", (error, stdout, stderr) => {
      if (error) {
        logger.error(`exec error: ${error}`);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to retrieve cron jobs" });
      }

      // Split the stdout by lines to get individual cron jobs
      const jobs = stdout
        .trim()
        .split("\n")
        .map((job) => {
          const parts = job.split(/\s+/);
          const schedule = parts.slice(0, 5).join(" ");
          const script_path = parts[5];

          // Match UUID
          const uniqueIdRegex = /(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/;
          const uniqueIdMatch = uniqueIdRegex.exec(job);
          const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : null;

          // Determine the type of job by looking at the scriptPath or its arguments
          let expense_type = null;

          const identifierWithIDRegex =
            /(\w+)_([0-9]+)_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;
          const identifierWithoutIDRegex =
            /(\w+)_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;

          let identifierMatch = identifierWithIDRegex.exec(parts[6]);

          if (identifierMatch) {
            expense_type = identifierMatch[1];
          } else {
            identifierMatch = identifierWithoutIDRegex.exec(parts[6]);
            if (identifierMatch) {
              expense_type = identifierMatch[1];
            }
          }

          let title, description;

          if (expense_type === "payroll") {
            title = "Payroll";
            // When extracting payroll description:
            // When extracting payroll description:
            const descriptionRegex = /"Payroll for ([^"]+)"/;
            const descriptionMatch = descriptionRegex.exec(job);
            if (descriptionMatch) {
              description = `Payroll for ${descriptionMatch[1]}`;
              description = description.replace(/\s+/g, " ");
            } else {
              description = null;
            }
          } else {
            const titleDescriptionRegex = /"([^"]*)" "([^"]*)"/;
            const titleDescMatch = titleDescriptionRegex.exec(job);
            title = titleDescMatch ? titleDescMatch[1] : null;
            description = titleDescMatch ? titleDescMatch[2] : null;
          }

          const [account_id, id, amount] = parts.slice(7, 10);

          return {
            unique_id: uniqueId,
            schedule,
            expense_type,
            script_path,
            account_id: Number(account_id),
            id: Number(id),
            amount: parseFloat(amount),
            title,
            description,
          };
        });

      if (unique_id) {
        const job = jobs.find((job) => job.unique_id === unique_id);

        // If the cron job is not found, return 404
        if (!job) {
          return res.status(404).json({
            status: "error",
            message: "Cron job not found",
          });
        }

        return res.status(200).json({ status: "success", data: job });
      }

      res.status(200).json({ status: "success", data: jobs });
    });
  } catch (error) {
    logger.error(error);
    handleError(res, `Failed to get cron ${unique_id ? "job" : "jobs"}`);
  }
};

/**
 *
 * @param req - Express request object
 * @param res - Express response object
 * Sends a POST request to the server to create a cron job
 */
export const createCronJob = async (req: Request, res: Response) => {
  const {
    schedule,
    script_path,
    expense_type,
    account_id,
    id,
    amount,
    title,
    description,
  } = req.body;

  try {
    // Generate a unique identifier
    const uniqueId = uuidv4();

    // Construct the command with the uniqueId and other parameters
    const cronCommand = `${script_path} ${expense_type}_${uniqueId} ${account_id} ${id} ${amount} "${title}" "${description}"`;

    exec(
      `(crontab -l ; echo '${schedule} ${cronCommand} > /app/cron.log 2>&1') | crontab - `,
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`exec error: ${error}`);
          return res
            .status(500)
            .json({ status: "error", message: "Failed to create cron job" });
        }

        logger.info("Cron job created with unique id: " + uniqueId.toString());
      }
    );

    res.status(201).json({
      status: "success",
      message: "Cron job created successfully",
      unique_id: uniqueId,
    });
  } catch (error) {
    logger.error(error);
    handleError(res, "Failed to create cron job");
  }
};

export const updateCronJob = async (req: Request, res: Response) => {
  const { unique_id } = req.params;
  const {
    schedule,
    script_path,
    expense_type,
    account_id,
    amount,
    id,
    title,
    description,
  } = req.body;

  // Generate a unique identifier
  const uniqueId = uuidv4();

  exec(`crontab -l | grep '${unique_id}'`, (error, stdout, stderr) => {
    if (error || !stdout) {
      logger.error(`exec error: ${error}`);
      return res.status(404).json({
        status: "error",
        message: "Cron job not found",
      });
    }

    // If the cron job is found, proceed with update
    exec(
      `crontab -l | grep -v '${unique_id}' | crontab -`,
      (delError, delStdout, delStderr) => {
        if (delError) {
          logger.error(`exec error: ${delError}`);
          return res.status(500).json({
            status: "error",
            message: "Failed to update cron job",
          });
        }

        // Construct the command with the uniqueId and other parameters
        const cronCommand = `${script_path} ${expense_type}_${uniqueId} ${account_id} ${id} ${amount} "${title}" "${description}"`;

        exec(
          `(crontab -l ; echo '${schedule} ${cronCommand} > /app/cron.log 2>&1') | crontab - `,
          (error, stdout, stderr) => {
            if (error) {
              logger.error(`exec error: ${error}`);
              return res.status(500).json({
                status: "error",
                message: "Failed to update cron job",
              });
            }

            logger.info(
              "Cron job updated with unique id: " + uniqueId.toString()
            );
          }
        );
      }
    );
  });

  res.json({
    status: "success",
    message: "Cron job updated successfully",
    unique_id: uniqueId,
  });
};

export const deleteCronJob = async (req: Request, res: Response) => {
  const { unique_id } = req.params;

  exec(`crontab -l | grep '${unique_id}'`, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.error(`exec error: ${error}`);
      return res.status(404).json({
        status: "error",
        message: "Cron job not found",
      });
    }

    // If the cron job is found, proceed with deletion
    exec(
      `crontab -l | grep -v '${unique_id}' | crontab -`,
      (delError, delStdout, delStderr) => {
        if (delError) {
          console.error(`exec error: ${delError}`);
          return res.status(500).json({
            status: "error",
            message: "Failed to delete cron job",
          });
        }

        logger.info("Cron job deleted with unique id: " + unique_id);

        res.json({
          status: "success",
          message: "Cron job deleted successfully",
        });
      }
    );
  });
};
