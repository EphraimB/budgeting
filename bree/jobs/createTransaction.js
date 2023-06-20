import pool from '../../config/db.js';
import { transactionQueries } from '../../models/queryData.js';

export const createTransaction = async (account_id, amount, description, destination_account_id) => {
    return new Promise((resolve, reject) => {
        pool.query(transactionQueries.createTransaction, [destination_account_id ? destination_account_id : account_id, destination_account_id ? -amount : amount, description], (error, results) => {
            if (error) {
                reject(error);
            }

            resolve(results.rows);
        });
    });
};
