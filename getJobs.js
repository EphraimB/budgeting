const pool = require("./db");
const { payrollQueries } = require("./queryData");
const fs = require("fs");
const jobsFilePath = 'jobs.json';
const getPayrolls = require("./getPayrolls");

const getJobs = () => {
    return new Promise((resolve, reject) => {
        pool.query(payrollQueries.getEmployees, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
                return;
            }

            let jobs = [];

            // Function to merge the payrollCheckerjobs array with the existing jobs array
            if (fs.existsSync(jobsFilePath)) {
                // Read the job definitions from the JSON file
                jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
            }

            // Execute the cronScriptGetPayrolls.js script if there are no jobs that start with payroll- in the jobs array
            if (!jobs.some(job => job.name.startsWith("payroll-"))) {
                results.rows.forEach((employee) => {
                    (async () => {
                        await getPayrolls(employee.employee_id);
                    })();
                });
            }

            const payrollCheckerjobs = results.rows.map((employee) => ({
                name: `payroll-checker-employee-${employee.employee_id}`,
                cron: "* * 1 * *",
                path: "/app/jobs/cronScriptGetPayrolls.js",
                worker: {
                    workerData: {
                        employee_id: employee.employee_id,
                    },
                },
            }));

            fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), 'utf8');

            jobs = jobs.concat(payrollCheckerjobs);

            resolve(jobs);
        });
    });
};

module.exports = getJobs;
