import pool from '../models/db.js';
import fs from 'fs';
import path from 'path';
const jobsFilePath = 'jobs.json';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { workerData } from 'worker_threads';
import { payrollQueries } from '../models/queryData.js';
import schedulePayrollCronJob from '../schedulePayrollCronJob.js';

(async () => {
    const { employee_id } = workerData;

    // Read the existing jobs from the file or create an empty array if the file doesn't exist
    let jobs = [];
    if (fs.existsSync(jobsFilePath)) {
        jobs = JSON.parse(fs.readFileSync(jobsFilePath));
    }

    // Get the unique IDs of the cron job to be deleted that start with 'payroll-'
    for (const job of jobs) {
        if (job.name.startsWith('payroll-')) {
            try {
                // Delete the cron job file
                const cronJobFilePath = path.join(__dirname, 'cron-jobs', `${job.name}.js`);
                fs.unlink(cronJobFilePath, (err) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    console.log(`Deleted cron job file ${job.name}.js`);
                });

            } catch (error) {
                console.error('Error deleting cron job:', error);
            }
        }
    }

    // Remove existing payroll- jobs from the array
    jobs = jobs.filter(job => !job.name.startsWith('payroll-'));

    // Write the updated jobs array to the file
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Updated jobs.json file`);
        }
    });

    try {
        const { rows: [{ account_id }] } = await pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id]);
        const { rows } = await pool.query(payrollQueries.getPayrolls, [employee_id]);

        for (const result of rows) {
            schedulePayrollCronJob(result, account_id);
        }

        // Exit the worker thread
        process.exit(0);
    } catch (error) {
        console.error('Error in worker thread:', error);
        process.exit(1); // Exit with a non-zero code to indicate an error occurred
    }
})();
