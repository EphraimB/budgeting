const pool = require('../db');
const { workerData } = require('worker_threads');
const { payrollQueries } = require('../queryData');
const schedulePayrollCronJob = require('./schedulePayrollCronJob');

(async () => {
    const { employee_id } = workerData;
    let account_id = null;

    return new Promise((resolve, reject) => {
        pool.query(payrollQueries.getAccountIdFromEmployee, [employee_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                account_id = results.rows[0].account_id;

                pool.query(payrollQueries.getPayrolls, [employee_id], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        results.rows.forEach((result) => {
                            schedulePayrollCronJob(result, account_id);
                        });
                        resolve(results.rows);
                    }
                });
            }
        });
    });
})();