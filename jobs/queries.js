const pool = require('../db');
const { Worker, isMainThread, workerData } = require('worker_threads');

// Create transaction for cron job
const createTransactionForCronJob = async () => {
    const { account_id, amount, description } = workerData;

    console.log(workerData);
    console.log(amount);

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