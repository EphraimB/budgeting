const pool = require('./db');
const fs = require('fs');
const path = require('path');
const jobsFilePath = 'jobs.json';
const { payrollQueries } = require('./queryData');
const schedulePayrollCronJob = require('./jobs/schedulePayrollCronJob');

const getPayrolls = async employee_id => {
    console.log('Running thread:', employee_id);
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
    } catch (error) {
        console.error('Error in thread:', error);
    }
};

module.exports = getPayrolls;
