import pool from './models/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { payrollQueries } from './models/queryData.js';
import schedulePayrollCronJob from './jobs/schedulePayrollCronJob.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const jobsFilePath = path.join(__dirname, 'jobs.json');

const deleteCronJobFile = (jobName) => {
  const cronJobFilePath = path.join(__dirname, 'jobs', 'cron-jobs', `${jobName}.js`);
  fs.unlink(cronJobFilePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Deleted cron job file ${jobName}.js`);
    }
  });
};

export const getPayrolls = async (employee_id) => {
  console.log('Running thread:', employee_id);

  try {
    // Read the existing jobs from the file or create an empty array if the file doesn't exist
    let jobs = [];
    if (fs.existsSync(jobsFilePath)) {
      jobs = JSON.parse(fs.readFileSync(jobsFilePath));
    }

    // Get the unique IDs of the cron job to be deleted that start with 'payroll-'
    const payrollJobs = jobs.filter((job) => job.name.startsWith('payroll-'));

    for (const job of payrollJobs) {
      deleteCronJobFile(job.name);
    }

    // Remove existing payroll- jobs from the array
    jobs = jobs.filter((job) => !job.name.startsWith('payroll-'));

    // Write the updated jobs array to the file
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Updated jobs.json file`);
      }
    });

    const { rows: [{ account_id }] } = await pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id]);
    const { rows } = await pool.query(payrollQueries.getPayrolls, [employee_id]);

    for (const result of rows) {
      schedulePayrollCronJob(result, account_id);
    }
  } catch (error) {
    console.error('Error in thread:', error);
  }
};
