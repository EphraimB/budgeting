import Bree from 'bree';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getJobs } from './getJobs.js';
import { Job } from 'bree';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let breeInstance: Bree | null = null;

/**
 * 
 * @param [cronjobsDir] - Directory where the cron jobs are located
 * @param [jobsFilePath] - Path to the jobs.json file
 * Initializes the bree instance
 */
export const initializeBree = async (cronjobsDir?: string, jobsFilePath?: string) => {
    try {
        cronjobsDir = cronjobsDir || path.join(__dirname, 'jobs/cron-jobs');
        jobsFilePath = jobsFilePath || path.join(__dirname, './jobs.json');

        if (!fs.existsSync(cronjobsDir)) {
            fs.mkdirSync(cronjobsDir);
        }

        if (!fs.existsSync(jobsFilePath)) {
            console.log("jobs.json does not exist, creating file...");
            fs.writeFileSync(jobsFilePath, JSON.stringify([], null, 2), 'utf8');
            console.log("Created jobs.json file.");
        }

        breeInstance = new Bree({
            root: cronjobsDir
        });

        const jobs = await getJobs();
        breeInstance.config.jobs = jobs as Job[];
        console.log('jobs', jobs);
        await breeInstance.start();
    } catch (error) {
        console.log(error);
    }
};

export const getBree = () => breeInstance;
