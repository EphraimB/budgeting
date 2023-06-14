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

    fs.writeFileSync(jobsFilePath, JSON.stringify(payrollJobs, null, 2), 'utf8');

    return payrollJobs;
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
