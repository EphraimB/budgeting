import { v4 as uuidv4 } from 'uuid';
import { getBree as getBreeModule } from '../breeManager.js';
import * as fsModule from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const createUniqueId = () => {
    return `payroll-${uuidv4()}`;
}

const createNewJob = (uniqueId, end_date, account_id, net_pay) => {
    const transactionDate = new Date(end_date);
    const cronDate = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${transactionDate.getDate()} ${transactionDate.getMonth() + 1} *`;

    return {
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
}

const updateJobsFile = (jobsFilePath, newJob, fs) => {
    let jobs = [];
    if (fs.existsSync(jobsFilePath)) {
        jobs = JSON.parse(fs.readFileSync(jobsFilePath));
    }

    // Add the new payroll job
    jobs.push(newJob);

    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2));
    console.log(`Updated jobs.json file`);
}

const schedulePayrollCronJob = async (payrollData, account_id, getBree, fs, filePath, jobsFilePath) => {
    getBree = getBree || getBreeModule;
    fs = fs || fsModule;

    let jobs = [];
    jobsFilePath = jobsFilePath || path.join(__dirname, '../jobs.json');
    const { end_date, net_pay } = payrollData;

    const uniqueId = createUniqueId();

    try {
        filePath = filePath || path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
        fs.closeSync(fs.openSync(filePath, 'w'));
    } catch (err) {
        console.error(err);
    }

    const newJob = createNewJob(uniqueId, end_date, account_id, net_pay);
    jobs.push(newJob);

    try {
        updateJobsFile(jobsFilePath, newJob, fs);
    } catch (err) {
        console.error(err);
    }

    try {
        return newJob;
    } catch (error) {
        console.error('Error while scheduling job:', error);
        throw error;
    }
};


export default schedulePayrollCronJob;
