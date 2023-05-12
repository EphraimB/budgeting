import Bree from 'bree';
import Cabin from 'cabin';
import path from 'path';
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');
import getJobs from './getJobs.js';

export const bree = new Bree({
  logger: new Cabin(),
  root: cronjobsDir
});

export const startBree = async () => {
  try {
    const jobs = await getJobs();
    bree.config.jobs = jobs;
    await bree.start();
  } catch (error) {
    console.log(error);
  }
};
