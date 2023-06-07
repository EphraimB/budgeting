import { default as poolModule } from './config/db.js';
import { payrollQueries as payrollQueriesFunction } from './models/queryData.js';
import schedulePayrollCronJob from './jobs/schedulePayrollCronJob.js';
import * as fsModule from 'fs';

export const getPayrolls = async (employee_id, pool, payrollQueries, schedulePayrollFunction, jobsFilePath, fs) => {
  schedulePayrollFunction = schedulePayrollFunction || schedulePayroll;
  pool = pool || poolModule;
  payrollQueries = payrollQueries || payrollQueriesFunction;
  jobsFilePath = jobsFilePath || './jobs.json';
  fs = fs || fsModule;

  console.log('Running thread:', employee_id);

  try {
    const { rows: [{ account_id }] } = await queryAccountFromEmployee(pool, payrollQueries, employee_id);
    const { rows } = await queryPayrolls(pool, payrollQueries, employee_id);

    const payrollJobs = await schedulePayrollFunction(rows, account_id);

    fs.writeFileSync(jobsFilePath, JSON.stringify(payrollJobs, null, 2), 'utf8');

    return payrollJobs;
  } catch (error) {
    console.error('Error in thread:', error);
    throw error;
  }
};

const queryAccountFromEmployee = async (pool, payrollQueries, employee_id) => {
  return await pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id]);
}

const queryPayrolls = async (pool, payrollQueries, employee_id) => {
  return await pool.query(payrollQueries.getPayrolls, [employee_id]);
}

const schedulePayroll = async (rows, account_id) => {
  const payrollJobs = [];
  for (const result of rows) {
    const newJob = await schedulePayrollCronJob(result, account_id);

    payrollJobs.push(newJob);
  }
  
  return payrollJobs;
}
