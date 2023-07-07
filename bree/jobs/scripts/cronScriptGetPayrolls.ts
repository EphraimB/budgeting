import pool from '../../../config/db.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { workerData } from 'worker_threads';
import { payrollQueries } from '../../../models/queryData.js';
import schedulePayrollCronJob from '../schedulePayrollCronJob.js';
import { JobOptions } from 'bree';

const jobsFilePath: string = 'jobs.json';
const __dirname: string = url.fileURLToPath(new URL('.', import.meta.url));

const deleteCronJobFiles = (jobs: JobOptions[]) => {
    jobs.forEach(job => {
        if (job.name.startsWith('payroll-')) {
            const cronJobFilePath: string = path.join(__dirname, 'cron-jobs', `${job.name}.js`);
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

const updateJobsFile = (jobs: JobOptions) => {
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

    let jobs: JobOptions[] = [];
    if (fs.existsSync(jobsFilePath)) {
        jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
    }

    deleteCronJobFiles(jobs);

    jobs = jobs.filter((job) => !job.name.startsWith('payroll-'));

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
