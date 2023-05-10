const pool = require('../db');
const { workerData } = require('worker_threads');
const { transactionQueries } = require('../queryData');

(async () => {
    const { account_id, amount, description } = workerData;
    return new Promise((resolve, reject) => {
        pool.query(transactionQueries.createTransaction, [account_id, amount, description], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows);
            }
        });
    });
})();