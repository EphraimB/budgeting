import pool from '../models/db.js';
import { workerData } from 'worker_threads';
import { transactionQueries } from '../models/queryData.js';

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