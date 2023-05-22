import Bree from 'bree';
import Cabin from 'cabin';
import path from 'path';
import * as url from 'url';
import getJobs from './getJobs.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');

let breeInstance = null;

export const initializeBree = async () => {
    try {
        breeInstance = new Bree({
            logger: new Cabin(),
            root: cronjobsDir
        });

        const jobs = await getJobs();
        breeInstance.config.jobs = jobs;
        await breeInstance.start();
    } catch (error) {
        console.log(error);
    }
};

export const getBree = () => breeInstance;
