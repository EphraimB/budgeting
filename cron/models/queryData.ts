interface CronJobQueries {
  cronJobsStartup: string;
  getCronJob: string;
  createCronJob: string;
  updateCronJob: string;
  deleteCronJob: string;
}

export const cronJobQueries: CronJobQueries = {
  cronJobsStartup: "SELECT * FROM cron_jobs",
  getCronJob: "SELECT * FROM cron_jobs WHERE cron_job_id = $1",
  createCronJob:
    "INSERT INTO cron_jobs (unique_id, cron_expression) VALUES ($1, $2) RETURNING *",
  updateCronJob:
    "UPDATE cron_jobs SET unique_id = $1, cron_expression = $2 WHERE cron_job_id = $3 RETURNING *",
  deleteCronJob: "DELETE FROM cron_jobs WHERE cron_job_id = $1",
};
