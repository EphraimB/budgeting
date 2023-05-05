const scheduleCronJob = (date, account_id, amount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, destination_account_id) => {
    const { v4: uuidv4 } = require('uuid');
    const { bree } = require('../app.js');
    const fs = require('fs');
    const path = require('path');
    const Cabin = require('cabin');
    let jobs = [];
    const jobsFilePath = path.join(__dirname, '../jobs.json');

    destination_account_id = destination_account_id || null;

    // Generate a unique id for the cron job
    const uniqueId = uuidv4();

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

    // Check if jobs.json exists, if not create it with an empty array
    if (!fs.existsSync(jobsFilePath)) {
        fs.writeFileSync(jobsFilePath, JSON.stringify([]));
    }

    // Read the existing jobs from the file
    jobs = JSON.parse(fs.readFileSync(jobsFilePath));

    // Create a new job and add it to the array
    const newJob = {
        name: uniqueId,
        cron: cronDate,
        path: path.join(__dirname, destination_account_id === null ? 'cronScriptCreate.js' : 'cronScriptTransferCreate.js'), // path to the worker file
        worker: {
            workerData: {
                account_id,
                amount,
                description,
                destination_account_id
            }
        }
    };
    jobs.push(newJob);

    // Write the updated jobs array to the file
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2));

    (async () => {
        await bree.add(newJob);
        await bree.start(newJob.name);
    })();

    return {
        cronDate,
        uniqueId
    };
}

module.exports = scheduleCronJob;