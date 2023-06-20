import pool from '../models/db.js';
import { workerData } from 'worker_threads';
import { transactionQueries } from '../models/queryData.js';

(async () => {
    const { account_id, amount, description } = workerData;

    try {
        const results = await createTransaction(account_id, amount, description, destination_account_id);
        // handle results as needed
    } catch (error) {
        console.error(error);
    }
})();