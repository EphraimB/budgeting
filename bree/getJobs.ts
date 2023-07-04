import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { getPayrolls } from './getPayrolls.js';
import { getEmployeesData } from '../bree/getEmployeesData.js';

interface PayrollJob {
    name: string;
    cron: string;
    path: string;
    worker: {
        workerData: {
            employee_id: string;
        };
    };
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * 
 * @param jobsFilePath - Path to the jobs.json file
 * @returns - Array of jobs
 */
export const getJobs = async (jobsFilePath: string): Promise<PayrollJob[]> => {
    try {
        const employeeData = await getEmployeesData();
        jobsFilePath = jobsFilePath || path.join(__dirname, './jobs.json');
        let jobs = [];

        // Function to merge the payrollCheckerjobs array with the existing jobs array
        if (fs.existsSync(jobsFilePath)) {
            // Read the job definitions from the JSON file
            jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
        }

        // Execute the cronScriptGetPayrolls.js script if there are no jobs that start with payroll- in the jobs array
        if (!jobs.some((job: PayrollJob) => job.name.startsWith('payroll-'))) {
            for (const employee of employeeData) {
                const newJob = await getPayrolls(parseInt(employee.employee_id), null);

                jobs.push(...newJob);
            }
        }

        const payrollCheckerjobs = employeeData.map((employee) => ({
            name: `payroll-checker-employee-${employee.employee_id}`,
            cron: '0 0 1 * *',
            path: '/app/bree/jobs/scripts/cronScriptGetPayrolls.js',
            worker: {
                workerData: {
                    employee_id: employee.employee_id
                }
            }
        }));

        jobs = jobs.concat(payrollCheckerjobs);

        return jobs;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
