import { workerData } from 'worker_threads';
import { createTransaction } from '../createTransaction.js';

(async () => {
    const { account_id, amount, description } = workerData;

    try {
        await createTransaction(account_id, amount, description);
    } catch (error) {
        console.error(error);
    }
})();
