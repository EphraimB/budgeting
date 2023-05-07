const pool = require("./db");
const { payrollQueries } = require("./queryData");
const fs = require("fs");
const jobsFilePath = 'jobs.json';
let jobs = [];

// Function to merge the payrollCheckerjobs array with the existing jobs array
if (fs.existsSync(jobsFilePath)) {
    // Read the job definitions from the JSON file
    jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
}

// Create the payroll checker job for each employee, query the database for the employee ids
pool.query(payrollQueries.getEmployees, (error, results) => {
    if (error) {
        console.log(error);
    }

    const payrollCheckerjobs = results.rows.map((employee) => ({
        name: `payroll-checker-employee-${employee.employee_id}`,
        cron: "0 0 1 * *",
        path: "/app/jobs/cronScriptCheckPayrolls.js",
        worker: {
            workerData: {
                employee_id: employee.employee_id,
            },
        },
    }));

    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs), 'utf8');
    
    jobs = jobs.concat(payrollCheckerjobs);

    console.log(jobs);
});

module.exports = { jobs };