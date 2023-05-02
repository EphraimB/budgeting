const updateCronJob = (cronId, date, amount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year) => {
    const schedule = require('node-schedule');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');

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

    return new Promise((resolve, reject) => {
        pool.query(cronJobQueries.getCronJob, [cronId], (error, results) => {
            if (error) {
                return reject(error);
            }
            const uniqueId = results.rows[0].unique_id;

            // Stop the running cron job if it exists
            const myJob = schedule.scheduledJobs[uniqueId];

            if (myJob) {
                myJob.cancel();
                console.log('Cron job stopped ' + cronId);

                // Update the cron job in the database
                pool.query(cronJobQueries.updateCronJob, [cronDate, cronId], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log('Cron job updated ' + cronId);

                    // Schedule the cron job to run on the specified date and time
                    const task = schedule.scheduleJob(uniqueId, cronDate, () => {
                        // Code to run when the cron job is triggered
                        console.log('Cron job triggered');

                        // Add amount to transactions table
                        pool.query(transactionQueries.createTransaction, [account_id, amount, description], (error, results) => {
                            if (error) {
                                reject({ errors: { "msg": "Error creating transaction", "param": null, "location": "query" } });
                            }
                        });
                    });
                    resolve(cronId);
                });
            } else {
                console.log('Cron job not found ' + cronId);
                reject({ errors: { "msg": "Cron job not found", "param": null, "location": "query" } });
            }
        });
    });
}

module.exports = updateCronJob;