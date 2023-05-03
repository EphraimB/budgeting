const deleteCronJob = (cronId) => {
    const { bree } = require('../app.js');
    const path = require('path');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');

    return new Promise((resolve, reject) => {
        // Fetch the unique_id from the database
        pool.query(cronJobQueries.getCronJob, [cronId], (error, results) => {
            if (error) {
                return reject(error);
            }
            const uniqueId = results.rows[0].unique_id;

            // Find the job with the given unique_id and delete it
            const jobToDelete = bree.config.jobs.find(job => job.name === uniqueId);
            if (jobToDelete) {
                bree.remove(jobToDelete.name);
                console.log(`Deleted cron job with unique_id ${uniqueId}`);
                resolve(`Deleted cron job with unique_id ${uniqueId}`);
            } else {
                console.log(`Could not find cron job with unique_id ${uniqueId}`);
                reject(`Could not find cron job with unique_id ${uniqueId}`);
            }

            // Don't forget to release the database connection
            pool.end();
        });
    });
}

module.exports = deleteCronJob