import pool from '../models/db.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { workerData } from 'worker_threads';
import { payrollQueries } from '../models/queryData.js';
import schedulePayrollCronJob from '../schedulePayrollCronJob.js';

const jobsFilePath = 'jobs.json';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const deleteCronJobFiles = (jobs) => {
    jobs.forEach(job => {
        if (job.name.startsWith('payroll-')) {
            const cronJobFilePath = path.join(__dirname, 'cron-jobs', `${job.name}.js`);
            fs.unlink(cronJobFilePath, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Deleted cron job file ${job.name}.js`);
                }
            });
        }
    });
};

const updateJobsFile = (jobs) => {
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Updated jobs.json file');
        }
    });
};

(async () => {
    const { employee_id } = workerData;

    let jobs = [];
    if (fs.existsSync(jobsFilePath)) {
        jobs = JSON.parse(fs.readFileSync(jobsFilePath));
    }

    deleteCronJobFiles(jobs);

    jobs = jobs.filter(job => !job.name.startsWith('payroll-'));

    updateJobsFile(jobs);

    try {
        const { rows: [{ account_id }] } = await pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id]);
        const { rows } = await pool.query(payrollQueries.getPayrolls, [employee_id]);

        for (const result of rows) {
            schedulePayrollCronJob(result, account_id);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error in worker thread:', error);
        process.exit(1);
    }
})();
