const scheduleCronJob = (date, account_id, amount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year) => {
    const Bree = require('bree');
    const { v4: uuidv4 } = require('uuid');
    const fs = require('fs');
    const path = require('path');
    const Cabin = require('cabin');

    // Generate a unique id for the cron job
    const uniqueId = uuidv4();

    const cronjobsDir = path.join(__dirname, 'cron-jobs');
    if (!fs.existsSync(cronjobsDir)) {
        fs.mkdirSync(cronjobsDir);
    }

    // write cron job unique id to file
    try {
        const filePath = path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
        fs.closeSync(fs.openSync(filePath, 'w'));
    } catch (err) {
        console.error(err);
    }

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

    const bree = new Bree({
        logger: new Cabin(),
        root: path.join(__dirname, 'cron-jobs'),
        jobs: [{
            name: uniqueId,
            cron: cronDate,
            path: path.join(__dirname, 'cronScript.js'), // path to the worker file
            worker: {
                workerData: {
                    account_id,
                    amount,
                    description
                }
            }
        }],
    });

    (async () => {
        await bree.start();
    })();

    return {
        cronDate,
        uniqueId
    };
}

module.exports = scheduleCronJob;