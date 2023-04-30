const scheduleCronJob = (account_id, date, amount, description) => {
    const cron = require('node-cron');
    const pool = require('./db');
    const { depositQueries } = require('./queries');
    // Create a new Date object from the provided date string
    const transactionDate = new Date(date);

    // Format the date and time for the cron job
    const cronDate = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${transactionDate.getDate()} ${transactionDate.getMonth() + 1} *`;

    // Schedule the cron job to run on the specified date and time
    cron.schedule(cronDate, () => {
        // Code to run when the cron job is triggered
        if (process.env.NODE_ENV === 'development') {
            console.log('Cron job triggered');
        }

        // Add amount to deposits or withdrawals table based on if the amount is positive or negative
        if (amount >= 0) {
            // Add amount to deposits table
            pool.query(depositQueries.createDeposit, [account_id, amount, description], (error, results) => {
                if (error) {
                    return response.status(400).send({ errors: { "msg": "Error creating deposit", "param": null, "location": "query" } });
                }
                response.status(201).json(results.rows);
            });
        } else {
            // Add amount to withdrawals table
            pool.query(withdrawalQueries.createWithdrawal, [account_id, amount, description], (error, results) => {
                if (error) {
                    return response.status(400).send({ errors: { "msg": "Error creating withdrawal", "param": null, "location": "query" } });
                }
                response.status(201).json(results.rows);
            });
        }
    });
}

module.exports = scheduleCronJob;