const pool = require('../db');
const { workerData } = require('worker_threads');
const { payrollQueries } = require('../queryData');

(async () => {
    const { employee_id } = workerData;
    return new Promise((resolve, reject) => {
        pool.query(payrollQueries.getPayrolls, [employee_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows);
            }
        });
    });
})();