const Bree = require('bree');
const Cabin = require('cabin');
const fs = require('fs');
const path = require('path');

const jobsFilePath = 'jobs.json';

// Read the job definitions from the JSON file
const jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));

const breeInstance = new Bree({
    logger: new Cabin(),
    root: path.join(__dirname, 'jobs/cron-jobs'),
    jobs
});

module.exports = breeInstance;
