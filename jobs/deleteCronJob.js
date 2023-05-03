const deleteCronJob = (cronId) => {
    const { bree } = require('../app.js');
    const fs = require('fs');
    const path = require('path');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');
    let uniqueId;

    return new Promise((resolve, reject) => {
        // Fetch the unique_id from the database
        pool.query(cronJobQueries.getCronJob, [cronId], (error, results) => {
            if (error) {
                return reject(error);
            }
            uniqueId = results.rows[0].unique_id;

            // Find the job with the given unique_id and delete it
            const jobToDelete = bree.config.jobs.find(job => job.name === uniqueId);
            if (jobToDelete) {
                bree.remove(jobToDelete.name);
                console.log(`Deleted cron job with unique_id ${uniqueId}`);

                // Delete the cron job file from the cron-jobs directory and the jobs.json file
                const cronJobFilePath = path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
                const jobsFilePath = path.join(__dirname, '../jobs.json');
                fs.unlink(cronJobFilePath, (err) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    console.log(`Deleted cron job file ${uniqueId}.js`);
                });

                fs.readFile(jobsFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    const jobs = JSON.parse(data);
                    const updatedJobs = jobs.filter(job => job.name !== uniqueId);

                    console.log(`Updated jobs array: ${updatedJobs}`);

                    fs.writeFile(jobsFilePath, JSON.stringify(updatedJobs, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            return reject(err);
                        }
                        console.log(`Updated jobs.json file`);
                    });
                });

                resolve(uniqueId);
            } else {
                console.log(`Could not find cron job with unique_id ${uniqueId}`);
                reject(`Could not find cron job with unique_id ${uniqueId}`);
            }
        });
    });
}

module.exports = deleteCronJob