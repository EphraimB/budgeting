const pool = require("./db");
const { payrollQueries } = require("./queryData");
const fs = require("fs");
const jobsFilePath = 'jobs.json';

let jobs = [];
const payrollCheckerjobs = [];

// Create the payroll checker job for each employee, query the database for the employee ids
pool.query(payrollQueries.getEmployees, (error, results) => {
    if (error) {
        console.log(error);
    }

    results.rows.forEach((employee) => {
        payrollCheckerjobs.push({
            name: `payroll-checker-employee-${employee.employee_id}`,
            cron: "0 0 1 * *",
            path: "/app/jobs/cronScriptCheckPayrolls.js",
            worker: {
                workerData: {
                    employee_id: employee.employee_id,
                },
            },
        });
    });
});


if (fs.existsSync(jobsFilePath)) {
    // Read the job definitions from the JSON file
    jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
}

// Add the payroll checker job to the jobs array
jobs = jobs.concat(payrollCheckerjobs);

module.exports = { jobs };