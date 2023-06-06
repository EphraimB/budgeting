import { default as poolModule } from './config/db.js';
import { payrollQueries as payrollQueriesFunction } from './models/queryData.js';
import schedulePayrollCronJob from './jobs/schedulePayrollCronJob.js';

export const getPayrolls = async (employee_id, pool, payrollQueries, schedulePayrollFunction) => {
  schedulePayrollFunction = schedulePayrollFunction || schedulePayroll;
  pool = pool || poolModule;
  payrollQueries = payrollQueries || payrollQueriesFunction;

  console.log('Running thread:', employee_id);

  try {
    const { rows: [{ account_id }] } = await queryAccountFromEmployee(pool, payrollQueries, employee_id);
    const { rows } = await queryPayrolls(pool, payrollQueries, employee_id);

    const payrollJobs = schedulePayrollFunction(rows, account_id);
    return payrollJobs;  // Return the created payroll jobs
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

const schedulePayroll = (rows, account_id) => {
  const payrollJobs = [];
  for (const result of rows) {
    schedulePayrollCronJob(result, account_id);
  }
  return payrollJobs;
}
