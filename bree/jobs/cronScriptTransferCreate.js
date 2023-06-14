import pool from '../models/db.js';
import { workerData } from 'worker_threads';
import { transactionQueries } from '../models/queryData.js';

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