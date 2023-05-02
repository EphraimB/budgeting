const pool = require('../db');

// Create transaction for cron job
const createTransactionForCronJob = (workerData) => {
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
}

module.exports = createTransactionForCronJob;