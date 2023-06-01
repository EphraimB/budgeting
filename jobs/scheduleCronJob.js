import { v4 as uuidv4 } from 'uuid';
import { getBree as getBreeModule } from '../breeManager.js';
import * as fsModule from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const createCronJob = ({
    account_id, amount, description, date,
    frequency_type, frequency_type_variable,
    frequency_day_of_month, frequency_day_of_week,
    frequency_week_of_month, frequency_month_of_year,
    destination_account_id = null
}) => {
    const uniqueId = uuidv4();
    const transactionDate = new Date(date);
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
        path: path.join(__dirname, destination_account_id === null ? 'cronScriptCreate.js' : 'cronScriptTransferCreate.js'),
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
            cronDay = frequency_day_of_month ? frequency_day_of_month : '*';
        } else {
            cronMonth = '*';
            cronDay = '*/' + 7 + (frequency_type_variable || 1);
        }
    } else if (frequency_type === 2) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 + (frequency_type_variable || 1) : frequency_day_of_week;
            cronDay = frequency_week_of_month ? '?' : frequency_day_of_month ? frequency_day_of_month : '*';
        } else {
            cronMonth = '*/' + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate();
        }
    } else if (frequency_type === 3) {
        if (frequency_day_of_week) {
            cronMonth = frequency_month_of_year ? frequency_month_of_year : '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 + (frequency_type_variable || 1) : frequency_day_of_week;
            cronDay = frequency_week_of_month ? '?' : frequency_day_of_month ? frequency_day_of_month : '*';
        } else {
            cronMonth = '*/' + 12 + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate();
        }
    }

    return { cronDay, cronMonth, cronDayOfWeek };
};

const writeCronJobToFile = (fs, jobsFilePath, jobs, newJob) => {
    jobs = jobs.filter(job => job.name !== "payroll-checker");
    jobs.push(newJob);
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), (err) => {
        if (err) {
            console.error(err);
            throw err;
        }
        console.log(`Updated jobs.json file`);
    });
};

const scheduleCronJob = async (getBree, fs, jobDetails) => {
    getBree = getBree || getBreeModule;
    fs = fs || fsModule;

    const jobsFilePath = path.join(__dirname, '../jobs.json');
    if (!fs.existsSync(jobsFilePath)) {
        fs.writeFileSync(jobsFilePath, JSON.stringify([]));
    }

    const jobs = JSON.parse(fs.readFileSync(jobsFilePath));
    const newJob = createCronJob(jobDetails);
    writeCronJobToFile(fs, jobsFilePath, jobs, newJob);

    const bree = getBree();
    await bree.add(newJob);
    await bree.start(newJob.name);

    return {
        cronDate: newJob.cron,
        uniqueId: newJob.name
    };
}

export default scheduleCronJob;