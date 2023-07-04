import { v4 as uuidv4 } from 'uuid';
import { getBree } from '../breeManager.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { JobOptions } from 'bree';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

interface CronJobData {
    account_id: number;
    amount: number;
    description: string;
    begin_date: string;
    frequency_type: number;
    frequency_type_variable: number;
    frequency_day_of_month: number;
    frequency_day_of_week: number;
    frequency_week_of_month: number;
    frequency_month_of_year: number;
    destination_account_id?: number | null;
}

interface CronValues {
    cronDay: string;
    cronMonth: string;
    cronDayOfWeek: string;
}

/**
 * 
 * @param cronJobData - Cron job data
 * @param uniqueId - Unique ID
 * @returns - New job
 */
const createCronJob = ({
    account_id, amount, description, begin_date,
    frequency_type, frequency_type_variable,
    frequency_day_of_month, frequency_day_of_week,
    frequency_week_of_month, frequency_month_of_year,
    destination_account_id = null
}: CronJobData, uniqueId: string): JobOptions => {
    const transactionDate: Date = new Date(begin_date);
    const { cronDay, cronMonth, cronDayOfWeek } = determineCronValues(
        frequency_type, frequency_type_variable,
        frequency_day_of_month, frequency_day_of_week,
        frequency_week_of_month, frequency_month_of_year,
        transactionDate
    );
    const cronDate: string = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${cronDay} ${cronMonth} ${cronDayOfWeek}`;

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

/**
 * 
 * @param frequency_type - Frequency type (0 = daily, 1 = weekly, 2 = monthly)
 * @param frequency_type_variable - Frequency type variable (e.g. 1 = every day, 2 = every other day, etc.)
 * @param frequency_day_of_month - Frequency day of month (e.g. 1 = every 1st of the month, 2 = every 2nd of the month, etc.)
 * @param frequency_day_of_week - Frequency day of week (e.g. 1 = every Monday, 2 = every Tuesday, etc.)
 * @param frequency_week_of_month - Frequency week of month (e.g. 0 = every 1st week of the month, 1 = every 2nd week of the month, etc.)
 * @param frequency_month_of_year - Frequency month of year (e.g. 0 = every January, 1 = every February, etc.)
 * @param transactionDate - Transaction date
 * @returns 
 */
const determineCronValues = (frequency_type: number, frequency_type_variable: number, frequency_day_of_month: number, frequency_day_of_week: number, frequency_week_of_month: number, frequency_month_of_year: number, transactionDate: Date): CronValues => {
    let cronDay = '*';
    let cronMonth = '*';
    let cronDayOfWeek = '*';

    if (frequency_type === 0) {
        cronDay = '*/' + (frequency_type_variable || 1);
    } else if (frequency_type === 1) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_day_of_week.toString();
            cronDay = frequency_day_of_month.toString() || '*';
        } else {
            cronMonth = '*';
            cronDay = '*/' + 7 * (frequency_type_variable || 1);
        }
    } else if (frequency_type === 2) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 * (frequency_type_variable || 1) : frequency_day_of_week.toString();
            cronDay = frequency_week_of_month ? '?' : (frequency_day_of_month.toString() || '*');
        } else {
            cronMonth = '*/' + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate().toString();
        }
    } else if (frequency_type === 3) {
        if (frequency_day_of_week) {
            cronMonth = frequency_month_of_year.toString() || '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 * (frequency_type_variable || 1) : frequency_day_of_week.toString();
            cronDay = frequency_week_of_month ? '?' : (frequency_day_of_month.toString() || '*');
        } else {
            cronMonth = '*/' + 12 * (frequency_type_variable || 1);
            cronDay = transactionDate.getDate().toString();
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
