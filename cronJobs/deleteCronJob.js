const deleteCronJob = (cronId) => {
    const cron = require('node-schedule');
    const pool = require('../db');
    const { cronJobQueries } = require('../queryData');

    return new Promise((resolve, reject) => {
        pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
            if (error) {
                return reject(error);
            }
            console.log('Cron job deleted ' + cronId);

            // Stop the running cron job if it exists
            const tasks = cron.getTasks();
            tasks.forEach((task) => {
                if (task.id === cronId) {
                    task.stop();
                    console.log('Cron job stopped ' + cronId);
                }
            });
            return resolve(results.rows[0]);
        });
    });
}

module.exports = deleteCronJob