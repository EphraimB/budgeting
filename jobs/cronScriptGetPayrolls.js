const pool = require('../db');
const fs = require('fs');
const jobsFilePath = 'jobs.json';
const { workerData } = require('worker_threads');
const { payrollQueries } = require('../queryData');
const schedulePayrollCronJob = require('./schedulePayrollCronJob');

(async () => {
    const { employee_id } = workerData;

    // Read the existing jobs from the file or create an empty array if the file doesn't exist
    let jobs = [];
    if (fs.existsSync(jobsFilePath)) {
        jobs = JSON.parse(fs.readFileSync(jobsFilePath));
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
