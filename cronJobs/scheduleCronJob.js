const scheduleCronJob = (account_id, date, amount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year) => {
    const cron = require('node-cron');
    const { v4: uuidv4 } = require('uuid');
    const pool = require('../db');
    const { transactionQueries, cronJobQueries } = require('../queryData');
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

    // Generate a unique id for the cron job
    const uniqueId = uuidv4();

    // Format the date and time for the cron job
    const cronDate = `${transactionDate.getMinutes()} ${transactionDate.getHours()} ${cronDay} ${cronMonth} ${cronDayOfWeek}`;

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating cron job", "param": null, "location": "query" } });
        }
    });

    // Schedule the cron job to run on the specified date and time
    const task = cron.schedule(cronDate, () => {
        // Code to run when the cron job is triggered
        console.log('Cron job triggered ' + task.id);

        // Add amount to transactions table
        pool.query(transactionQueries.createTransaction, [account_id, amount, description], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error creating transaction", "param": null, "location": "query" } });
            }
        });
    });

    task.id = uniqueId;
}

module.exports = scheduleCronJob;