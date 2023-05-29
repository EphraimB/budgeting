import pool from "./models/db.js";
import { payrollQueries } from "./models/queryData.js";
import fs from "fs";
import { getPayrolls as getPayrollsFunction } from "./getPayrolls.js";

// Function to fetch employee data from the database
export const getEmployeesData = () => {
    return new Promise((resolve, reject) => {
        pool.query(payrollQueries.getEmployees, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
                return;
            }

            resolve(results.rows);
        });
    });
};

// Main function to get jobs
export const getJobs = async (employeeData, getPayrolls, jobsFilePath) => {
    try {
        employeeData = employeeData || await getEmployeesData();
        getPayrolls = getPayrolls || getPayrollsFunction;
        jobsFilePath = jobsFilePath || 'jobs.json';
        let jobs = [];

        // Function to merge the payrollCheckerjobs array with the existing jobs array
        if (fs.existsSync(jobsFilePath)) {
            // Read the job definitions from the JSON file
            jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
        }

        // Execute the cronScriptGetPayrolls.js script if there are no jobs that start with payroll- in the jobs array
        if (!jobs.some((job) => job.name.startsWith("payroll-"))) {
            for (const employee of employeeData) {
                await getPayrolls(employee.employee_id);
            }
        }

        const payrollCheckerjobs = employeeData.map((employee) => ({
            name: `payroll-checker-employee-${employee.employee_id}`,
            cron: "0 0 1 * *",
            path: "/app/jobs/cronScriptGetPayrolls.js",
            worker: {
                workerData: {
                    employee_id: 1,
                },
            },
        }));

        fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), 'utf8');

        jobs = jobs.concat(payrollCheckerjobs);

        return jobs;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
