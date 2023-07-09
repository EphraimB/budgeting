import pool from '../../config/db.js';
import { transactionHistoryQueries } from '../../models/queryData.js';

/**
 * 
 * @param account_id - The account_id of the account to create the transaction for
 * @param amount - The amount of the transaction
 * @param description - The description of the transaction
 * @param [destination_account_id] - The destination_account_id of the transaction
 * @returns 
 */
export const createTransaction = async (account_id: number, amount: number, description: string, destination_account_id?: number) => {
    return new Promise((resolve, reject) => {
        pool.query(transactionHistoryQueries.createTransaction, [destination_account_id || account_id, destination_account_id ? -amount : amount, description], (error, results) => {
            if (error) {
                reject(error);
            }

            resolve(results.rows);
        });
    });
};
