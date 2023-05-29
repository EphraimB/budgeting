import Bree from 'bree';
import fs from 'fs';
import path from 'path';
import Cabin from 'cabin';
import { fileURLToPath } from 'url';
import { getJobs } from './getJobs.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');

if (!fs.existsSync(cronjobsDir)) {
    fs.mkdirSync(cronjobsDir);
}

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
