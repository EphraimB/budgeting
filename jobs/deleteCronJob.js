const deleteCronJob = (cronId) => {
    const Bree = require('bree');
    const path = require('path');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');

    const bree = new Bree({
        root: path.join(__dirname, 'cron-jobs'),
    });

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
                bree.delete(jobToDelete.name);
                console.log(`Deleted cron job with unique_id ${uniqueId}`);
            } else {
                console.log(`Could not find cron job with unique_id ${uniqueId}`);
            }

            // Don't forget to release the database connection
            pool.end();
        });
    });

    //     return new Promise((resolve, reject) => {
    //         pool.query(cronJobQueries.getCronJob, [cronId], (error, results) => {
    //             if (error) {
    //                 return reject(error);
    //             }
    //             const uniqueId = results.rows[0].unique_id;

    //             // Stop the running cron job if it exists
    //             const myJob = schedule.scheduledJobs[uniqueId];

    //             if(myJob) {
    //                 myJob.cancel();
    //                 console.log('Cron job stopped ' + cronId);

    //                 // Delete the cron job from the database
    //                 pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
    //                     if (error) {
    //                         return reject(error);
    //                     }
    //                     console.log('Cron job deleted ' + cronId);
    //                 });
    //             } else {
    //                 console.log('Cron job not found ' + cronId);
    //             }
    //         });
    //     });
}

module.exports = deleteCronJob