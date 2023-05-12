const Bree = require('bree');
const Cabin = require('cabin');
const path = require('path');
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');
const getJobs = require('./getJobs');

const bree = new Bree({
  logger: new Cabin(),
  root: cronjobsDir
});

async function startBree() {
  try {
    const jobs = await getJobs();
    bree.config.jobs = jobs;
    await bree.start();
  } catch (error) {
    console.log(error);
  }
}

module.exports = { bree, startBree };
