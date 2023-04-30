const scheduleCronJob = (account_id, date, amount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year) => {
    const cron = require('node-cron');
    const pool = require('./db');
    const { depositQueries, withdrawalQueries } = require('./queryData');
    // Create a new Date object from the provided date string
    const transactionDate = new Date(date);
    let cronDay = '*';
    let cronMonth = '*';
    let cronDayOfWeek = '*';

    if (frequency_type === 0) {
        cronDay = '*/' + (frequency_type_variable || 1);
    } else if (frequency_type === 1) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_day_of_week;
            cronDay = frequency_day_of_month ? frequency_day_of_month : '*';
        } else {
            cronMonth = '*';
            cronDay = '*/' + 7 + (frequency_type_variable || 1);
        }
    } else if (frequency_type === 2) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 + (frequency_type_variable || 1) : frequency_day_of_week;
            cronDay = frequency_week_of_month ? '?' : frequency_day_of_month ? frequency_day_of_month : '*';
        } else {
            cronMonth = '*/' + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate();
        }
    } else if (frequency_type === 3) {
        if (frequency_day_of_week) {
            cronMonth = frequency_month_of_year ? frequency_month_of_year : '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 + (frequency_type_variable || 1) : frequency_day_of_week;
            cronDay = frequency_week_of_month ? '?' : frequency_day_of_month ? frequency_day_of_month : '*';
        } else {
            cronMonth = '*/' + 12 + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate();
        }
    }

    // Format the date and time for the cron job
    const cronDate = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${cronDay} ${cronMonth} ${cronDayOfWeek}`;

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