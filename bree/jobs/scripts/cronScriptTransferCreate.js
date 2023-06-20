import { workerData } from 'worker_threads';
import { createTransaction } from '../createTransaction.js';

(async () => {
    const { account_id, amount, description, destination_account_id } = workerData;
    try {
        const results = await createTransaction(account_id, amount, description, destination_account_id);
        // handle results as needed
    } catch (error) {
        console.error(error);
    }
})();
