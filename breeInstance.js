const Bree = require('bree');
const fs = require('fs');
const Cabin = require('cabin');
const path = require('path');

const jobsFilePath = 'jobs.json';
let breeInstance;

if (fs.existsSync(jobsFilePath)) {
    // Read the job definitions from the JSON file
    const jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));

    breeInstance = new Bree({
        logger: new Cabin(),
        root: path.join(__dirname, 'jobs/cron-jobs'),
        jobs
    });
}

module.exports = breeInstance;
