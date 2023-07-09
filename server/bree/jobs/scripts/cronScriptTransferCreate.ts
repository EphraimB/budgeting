import { workerData } from 'worker_threads';
import { createTransaction } from '../createTransaction.js';

(async () => {
    const { account_id, amount, description, destination_account_id } = workerData;
    try {
        await createTransaction(account_id, amount, description, destination_account_id);
    } catch (error) {
        console.error(error);
    }
})();
