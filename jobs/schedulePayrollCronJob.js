import { v4 as uuidv4 } from 'uuid';
import { initializeBree } from '../breeManager.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const schedulePayrollCronJob = (payrollData, account_id) => {
    let jobs = [];
    const jobsFilePath = path.join(__dirname, '../jobs.json');
    const { end_date, net_pay } = payrollData;

    // Generate a unique id for the cron job
    const uniqueId = `payroll-${uuidv4()}`;

    // write cron job unique id to file
    try {
        const filePath = path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
        fs.closeSync(fs.openSync(filePath, 'w'));
    } catch (err) {
        console.error(err);
    }

    // Create a new Date object from the provided date string
    const transactionDate = new Date(end_date);

    // Format the date and time for the cron job
    const cronDate = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${transactionDate.getDate()} ${transactionDate.getMonth() + 1} *`;

    // Check if jobs.json exists, if not create it with an empty array
    if (!fs.existsSync(jobsFilePath)) {
        fs.writeFileSync(jobsFilePath, JSON.stringify([]));
    }

    // Read the existing jobs from the file
    jobs = JSON.parse(fs.readFileSync(jobsFilePath));

    // Create a new job and add it to the array
    const newJob = {
        name: uniqueId,
        cron: cronDate,
        path: path.join(__dirname, 'cronScriptCreate.js'),
        worker: {
            workerData: {
                account_id,
                amount: parseFloat(net_pay),
                description: 'Payroll'
            }
        }
    };
    jobs.push(newJob);

    jobs = jobs.filter(job => job.name !== "payroll-checker");

    // Write the updated jobs array to the file
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), (err) => {
        if (err) {
            console.error(err);
            return reject(err);
        }
        console.log(`Updated jobs.json file`);
    });

    (async () => {
        await bree.add(newJob);
        await bree.start(newJob.name);
    })();

};

export default schedulePayrollCronJob;
