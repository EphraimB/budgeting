import pool from '../config/db.js';
import { payrollQueries } from '../models/queryData.js';
import { fileURLToPath } from 'url';
import path from 'path';
import schedulePayrollCronJob from './jobs/schedulePayrollCronJob.js';
import fs from 'fs';

interface PayrollJob {
    name: string;
    cron: string;
    path: string;
    worker: {
        workerData: any;
    };
}

interface AccountIdResult {
    account_id: number;
}

interface Payroll {
    end_date: string;
    net_pay: number;
}

const __dirname: string = fileURLToPath(new URL('.', import.meta.url));

/**
 * 
 * @param employee_id - The employee_id of the employee to get the payrolls for
 * @param jobsFilePath - Path to the jobs.json file
 * @returns - Array of jobs
 */
export const getPayrolls = async (employee_id: number, jobsFilePath: string) => {
    jobsFilePath = jobsFilePath || path.join(__dirname, './jobs.json');

    // Delete all jobs in jobs.json that start with payroll-
    try {
        const jobs: PayrollJob[] = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
        const filteredJobs = jobs.filter(job => !job.name.startsWith('payroll-'));
        fs.writeFileSync(jobsFilePath, JSON.stringify(filteredJobs));
    } catch (err) {
        console.error(err);
    }

    // Delete all [uniqueId].js files in bree/jobs that start with payroll-
    try {
        const files = fs.readdirSync(path.join(__dirname, 'jobs/cron-jobs'));
        files.forEach(file => {
            if (file.startsWith('payroll-')) {
                fs.unlinkSync(path.join(__dirname, 'jobs/cron-jobs', file));
            }
        });
    } catch (err) {
        console.error(err);
    }

    console.log('Running thread:', employee_id);

    try {
        const { rows: [{ account_id }] } = await pool.query<AccountIdResult>(payrollQueries.getAccountIdFromEmployee, [employee_id]);
        const { rows } = await pool.query<Payroll>(payrollQueries.getPayrolls, [employee_id]);

        const payrollJobs = await schedulePayroll(rows, account_id);

        // Read the existing jobs from jobs.json
        let existingJobs = [];
        if (fs.existsSync(jobsFilePath)) {
            existingJobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
        }

        // Append the new jobs to the existing ones
        existingJobs.push(...payrollJobs);

        fs.writeFileSync(jobsFilePath, JSON.stringify(existingJobs, null, 2), 'utf8');

        return payrollJobs;
    } catch (error) {
        console.error('Error in thread:', error);
    }
};

/**
 * 
 * @param rows - The rows returned from the getPayrolls query
 * @param account_id - The account_id of the employee
 * @returns - Array of jobs
 */
const schedulePayroll = async (rows: Payroll[], account_id: number) => {
    const payrollJobs = [];
    for (const result of rows) {
        const newJob: PayrollJob = await schedulePayrollCronJob(result, account_id, null, null);

        payrollJobs.push(newJob);
    }

    return payrollJobs;
};
