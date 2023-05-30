import { default as fsModule } from 'fs';
import { default as pathModule } from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { default as poolModule } from './models/db.js';
import { payrollQueries } from './models/queryData.js';
import schedulePayrollCronJob from './jobs/schedulePayrollCronJob.js';

export const getPayrolls = async (employee_id, pool, fs, jobsFilePath) => {
  pool = pool || poolModule;
  fs = fs || fsModule;
  jobsFilePath = jobsFilePath || pathModule.join(__dirname, './jobs.json');

  console.log('Running thread:', employee_id);

  try {
    const jobs = readJobs(fs, jobsFilePath);
    const payrollJobs = filterPayrollJobs(jobs);

    deletePayrollCronJobs(fs, payrollJobs);
    updateJobsFile(fs, jobsFilePath, jobs, payrollJobs);

    const { rows: [{ account_id }] } = await queryAccountFromEmployee(pool, employee_id);
    const { rows } = await queryPayrolls(pool, employee_id);

    schedulePayroll(rows, account_id);
  } catch (error) {
    console.error('Error in thread:', error);
  }
};

const readJobs = (fs, filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return [];
}

const filterPayrollJobs = jobs => {
  return jobs.filter((job) => job.name.startsWith('payroll-'));
}

const deletePayrollCronJobs = (fs, payrollJobs) => {
  for (const job of payrollJobs) {
    deleteCronJobFile(fs, job.name);
  }
}

const deleteCronJobFile = (fs, jobName) => {
  const cronJobFilePath = path.join(__dirname, 'jobs', 'cron-jobs', `${jobName}.js`);
  fs.unlink(cronJobFilePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Deleted cron job file ${jobName}.js`);
    }
  });
}

const updateJobsFile = (fs, jobsFilePath, jobs, payrollJobs) => {
  const updatedJobs = jobs.filter((job) => !payrollJobs.includes(job));

  fs.writeFileSync(jobsFilePath, JSON.stringify(updatedJobs, null, 2), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Updated jobs.json file`);
    }
  });
}

const queryAccountFromEmployee = async (pool, employee_id) => {
  return await pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id]);
}

const queryPayrolls = async (pool, employee_id) => {
  return await pool.query(payrollQueries.getPayrolls, [employee_id]);
}

const schedulePayroll = (rows, account_id) => {
  for (const result of rows) {
    schedulePayrollCronJob(result, account_id);
  }
}
