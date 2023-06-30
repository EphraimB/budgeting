import { v4 as uuidv4 } from 'uuid';
import { getBree } from '../breeManager.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const createCronJob = ({
    account_id, amount, description, begin_date,
    frequency_type, frequency_type_variable,
    frequency_day_of_month, frequency_day_of_week,
    frequency_week_of_month, frequency_month_of_year,
    destination_account_id = null
}, uniqueId) => {
    const transactionDate = new Date(begin_date);
    const { cronDay, cronMonth, cronDayOfWeek } = determineCronValues(
        frequency_type, frequency_type_variable,
        frequency_day_of_month, frequency_day_of_week,
        frequency_week_of_month, frequency_month_of_year,
        transactionDate
    );
    const cronDate = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${cronDay} ${cronMonth} ${cronDayOfWeek}`;

    return {
        name: uniqueId,
        cron: cronDate,
        path: path.join(__dirname, destination_account_id === null ? 'scripts/cronScriptCreate.js' : 'scripts/cronScriptTransferCreate.js'),
        worker: {
            workerData: {
                account_id,
                amount,
                description,
                destination_account_id
            }
        }
    };
};

const determineCronValues = (frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, transactionDate) => {
    let cronDay = '*';
    let cronMonth = '*';
    let cronDayOfWeek = '*';

    if (frequency_type === 0) {
        cronDay = '*/' + (frequency_type_variable || 1);
    } else if (frequency_type === 1) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_day_of_week;
            cronDay = frequency_day_of_month || '*';
        } else {
            cronMonth = '*';
            cronDay = '*/' + 7 * (frequency_type_variable || 1);
        }
    } else if (frequency_type === 2) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 * (frequency_type_variable || 1) : frequency_day_of_week;
            cronDay = frequency_week_of_month ? '?' : (frequency_day_of_month || '*');
        } else {
            cronMonth = '*/' + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate();
        }
    } else if (frequency_type === 3) {
        if (frequency_day_of_week) {
            cronMonth = frequency_month_of_year || '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 * (frequency_type_variable || 1) : frequency_day_of_week;
            cronDay = frequency_week_of_month ? '?' : (frequency_day_of_month || '*');
        } else {
            cronMonth = '*/' + 12 * (frequency_type_variable || 1);
            cronDay = transactionDate.getDate();
        }
    }

    return { cronDay, cronMonth, cronDayOfWeek };
};

const writeCronJobToFile = (jobsFilePath, jobs, newJob) => {
    jobs = jobs.filter(job => job.name !== 'payroll-checker');
    jobs.push(newJob);
    try {
        fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2));
        console.log('Updated jobs.json file');
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const scheduleCronJob = async (jobDetails, filePath, jobsFilePath) => {
    const uniqueId = uuidv4();
    jobsFilePath = jobsFilePath || path.join(__dirname, '../jobs.json');
    if (!fs.existsSync(jobsFilePath)) {
        fs.writeFileSync(jobsFilePath, JSON.stringify([]));
    }

    const jobs = JSON.parse(fs.readFileSync(jobsFilePath));
    const newJob = createCronJob(jobDetails, uniqueId);
    writeCronJobToFile(jobsFilePath, jobs, newJob);

    try {
        filePath = filePath || path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
        fs.closeSync(fs.openSync(filePath, 'w'));
    } catch (err) {
        console.error(err);
    }

    const bree = getBree();
    await bree.add(newJob);
    await bree.start(newJob.name);

    return {
        cronDate: newJob.cron,
        uniqueId: newJob.name
    };
};

export default scheduleCronJob;
