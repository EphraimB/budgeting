import pool from '../config/db.js';
import { payrollQueries } from '../models/queryData.js';
import { fileURLToPath } from 'url';
import path from 'path';
import schedulePayrollCronJob from './jobs/schedulePayrollCronJob.js';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const getPayrolls = async (employee_id, jobsFilePath) => {
  jobsFilePath = jobsFilePath || path.join(__dirname, './jobs.json');

  console.log('Running thread:', employee_id);

  try {
    const { rows: [{ account_id }] } = await pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id]);
    const { rows } = await pool.query(payrollQueries.getPayrolls, [employee_id]);

    const payrollJobs = await schedulePayroll(rows, account_id);

    // Read the existing jobs from jobs.json
    let existingJobs = [];
    if (fs.existsSync(jobsFilePath)) {
      existingJobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
    }

    // Filter out the jobs that start with payroll-
    existingJobs = existingJobs.filter(job => !job.name.startsWith('payroll-'));

    // Append the new jobs to the existing ones
    existingJobs.push(...payrollJobs);

    fs.writeFileSync(jobsFilePath, JSON.stringify(existingJobs, null, 2), 'utf8');

    return existingJobs;
  } catch (error) {
    console.error('Error in thread:', error);
    throw error;
  }
};

const schedulePayroll = async (rows, account_id) => {
  const payrollJobs = [];
  for (const result of rows) {
    const newJob = await schedulePayrollCronJob(result, account_id);

    payrollJobs.push(newJob);
  }

  return payrollJobs;
}
