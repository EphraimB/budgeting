import Bree from 'bree';
import fs from 'fs';
import path from 'path';
import Cabin from 'cabin';
import { fileURLToPath } from 'url';
import { getJobs } from './getJobs.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let breeInstance: Bree | null = null;

/**
 * 
 * @param [cronjobsDir] - Directory where the cron jobs are located
 * Initializes the bree instance
 */
export const initializeBree = async (cronjobsDir?: string) => {
    try {
        cronjobsDir = cronjobsDir || path.join(__dirname, 'jobs/cron-jobs');

        if (!fs.existsSync(cronjobsDir)) {
            fs.mkdirSync(cronjobsDir);
        }

        breeInstance = new Bree({
            logger: new Cabin(),
            root: cronjobsDir
        });

        const jobs = await getJobs();
        breeInstance.config.jobs = jobs;
        console.log('jobs', jobs);
        await breeInstance.start();
    } catch (error) {
        console.log(error);
    }
};

export const getBree = () => breeInstance;
