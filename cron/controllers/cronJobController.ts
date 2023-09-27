import { exec } from "child_process";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const getCronJobs = async (req: Request, res: Response) => {
  const { unique_id } = req.query;

  exec("crontab -l", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to retrieve cron jobs" });
    }

    // Split the stdout by lines to get individual cron jobs
    const jobs = stdout
      .trim()
      .split("\n")
      .map((job) => {
        // Split by space to separate schedule from command
        const parts = job.split(/\s+/);
        const schedule = parts.slice(0, 5).join(" ");
        const command = parts.slice(5).join(" ");

        // Extract the uniqueId using a regex pattern
        const uniqueIdRegex = /(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/;
        const match = uniqueIdRegex.exec(command);
        const uniqueId = match ? match[1] : null;

        return { uniqueId, schedule, command };
      });

    if (unique_id) {
      const job = jobs.find((job) => job.uniqueId === unique_id);
      return res.json({ status: "success", data: job });
    }

    res.json({ status: "success", data: jobs });
  });
};

export const createCronJob = async (req: Request, res: Response) => {
  const { schedule, script_path, account_id, id, amount, title, description } =
    req.body;

  // Generate a unique identifier
  const uniqueId = uuidv4();

  // Construct the command with the uniqueId and other parameters
  const cronCommand = `${script_path} ${uniqueId} ${account_id} ${id} ${amount} "${title}" "${description}"`;

  exec(
    `(crontab -l ; echo '${schedule} ${cronCommand} > /app/cron.log 2>&1') | crontab - `,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to create cron job" });
      }

      res.json({
        status: "success",
        message: "Cron job created successfully",
        uniqueId,
      });
    }
  );
};

export const updateCronJob = async (req: Request, res: Response) => {};

export const deleteCronJob = async (req: Request, res: Response) => {};
