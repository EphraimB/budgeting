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
        const parts = job.split(/\s+/);
        const schedule = parts.slice(0, 5).join(" ");
        const script_path = parts[5];

        // Match UUID
        const uniqueIdRegex = /(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/;
        const uniqueIdMatch = uniqueIdRegex.exec(job);
        const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : null;

        // Extract title and description using a regex
        const titleDescriptionRegex = /"([^"]+)" "([^"]+)"/;
        const titleDescMatch = titleDescriptionRegex.exec(job);
        const titleAndDescription = titleDescMatch
          ? titleDescMatch.slice(1)
          : [null, null];

        // Determine the type of job by looking at the scriptPath or its arguments
        let expense_type = null;

        // For payroll type
        if (script_path.includes("createTransaction.sh")) {
          const identifierRegex =
            /(\w+)_([0-9]+)_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;
          const identifierMatch = identifierRegex.exec(parts[6]);

          if (identifierMatch) {
            expense_type = identifierMatch[1]; // This gives us "payroll" or any other type
          }
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
          title: titleAndDescription[0],
          description: titleAndDescription[1],
        };
      });

    if (unique_id) {
      const job = jobs.find((job) => job.unique_id === unique_id);
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
