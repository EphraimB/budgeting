const deleteCronJob = (cronId) => {
    const schedule = require('node-schedule');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');

    return new Promise((resolve, reject) => {
        pool.query(cronJobQueries.getCronJob, [cronId], (error, results) => {
            if (error) {
                return reject(error);
            }
            const uniqueId = results.rows[0].unique_id;

            // Stop the running cron job if it exists
            const myJob = schedule.scheduledJobs[uniqueId];

            if(myJob) {
                myJob.cancel();
                console.log('Cron job stopped ' + cronId);

                // Delete the cron job from the database
                pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log('Cron job deleted ' + cronId);
                });
            } else {
                console.log('Cron job not found ' + cronId);
            }

            return resolve(results.rows[0]);
        });
    });
}

module.exports = deleteCronJob