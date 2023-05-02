const cronJobsStartup = (cronId) => {
    const schedule = require('node-schedule');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');

    // Retrieve the cron jobs from the database and schedule them
    pool.query(cronJobQueries.cronJobsStartup, (error, results) => {
        if (error) {
            console.error('Error retrieving cron jobs from database:', error);
            return;
        }

        // Loop through the results and schedule each job
        for (const row of results.rows) {
            const { unique_id, cron_expression } = row;

            // Recreate the job using the name and cron expression from the database
            schedule.scheduleJob(unique_id, cron_expression, () => {
                console.log(`Cron job ${unique_id} triggered`);
                // Add your code to run when the cron job is triggered here
            });

            console.log(`Scheduled cron job ${unique_id} with expression ${cron_expression}`);
        }
    });
}