const pool = require('../db');
const { workerData } = require('worker_threads');
const { transactionQueries } = require('../queryData');

(async () => {
    const { account_id, amount, description, destination_account_id } = workerData;
    return new Promise((resolve, reject) => {
        pool.query(transactionQueries.createTransaction, [account_id, amount, description], (error, results) => {
            if (error) {
                reject(error);
            } else {
                pool.query(transactionQueries.createTransaction, [destination_account_id, -amount, description], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.rows);
                    }
                });
            }
        });
    });
})();