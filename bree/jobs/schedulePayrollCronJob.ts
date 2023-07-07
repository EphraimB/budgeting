import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { JobOptions } from 'bree';

interface PayrollData {
    end_date: string;
    net_pay: number;
}

/**
 * 
 * @returns - Unique ID
 */
const createUniqueId = () => {
    return `payroll-${uuidv4()}`;
};

/**
 * 
 * @param uniqueId - Unique ID
 * @param end_date - Payroll end date
 * @param account_id - The account_id of the employee
 * @param net_pay - The net_pay of the payroll
 * @returns - New job
 */
const createNewJob = (uniqueId: string, end_date: string, account_id: number, net_pay: number): JobOptions => {
    const transactionDate: Date = new Date(end_date);
    const cronDate: string = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${transactionDate.getDate()} ${transactionDate.getMonth() + 1} *`;

    return {
        name: uniqueId,
        cron: cronDate,
        path: path.join(__dirname, 'scripts/cronScriptCreate.js'),
        worker: {
            workerData: {
                account_id,
                amount: net_pay,
                description: 'Payroll'
            }
        }
    };
};

/**
 * 
 * @param payrollData - Payroll data
 * @param account_id - The account_id of the employee
 * @param [filePath] - Path to the cron job file
 * @param [jobsFilePath] - Path to the jobs.json file
 * @returns - New job
 */
const schedulePayrollCronJob = async (payrollData: PayrollData, account_id: number, filePath?: string | null, jobsFilePath?: string | null): Promise<JobOptions> => {
    const jobs = [];
    jobsFilePath = jobsFilePath || path.join(__dirname, '../jobs.json');
    const { end_date, net_pay } = payrollData;

    const uniqueId: string = createUniqueId();

    try {
        filePath = filePath || path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
        fs.closeSync(fs.openSync(filePath, 'w'));
    } catch (err) {
        console.error(err);
    }

    const newJob = createNewJob(uniqueId, end_date, account_id, net_pay);
    jobs.push(newJob);

    try {
        return newJob;
    } catch (error) {
        console.error('Error while scheduling job:', error);
        throw error;
    }
};

export default schedulePayrollCronJob;
