import { initializeBree } from '../breeManager.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import pool from '../models/db.js';
import { cronJobQueries } from '../models/queryData.js';

const deleteCronJob = async (cronId) => {
    try {
        const results = await pool.query(cronJobQueries.getCronJob, [cronId]);
        const uniqueId = results.rows[0].unique_id;

        const jobToDelete = bree.config.jobs.find((job) => job.name === uniqueId);
        if (jobToDelete) {
            bree.remove(jobToDelete.name);
            console.log(`Deleted cron job with unique_id ${uniqueId}`);

            const cronJobFilePath = path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
            const jobsFilePath = path.join(__dirname, '../jobs.json');

            await fs.promises.unlink(cronJobFilePath);
            console.log(`Deleted cron job file ${uniqueId}.js`);

            const data = await fs.promises.readFile(jobsFilePath, 'utf8');
            const jobs = JSON.parse(data);
            const updatedJobs = jobs.filter((job) => job.name !== uniqueId && job.name !== 'payroll-checker');
            await fs.promises.writeFile(jobsFilePath, JSON.stringify(updatedJobs, null, 2));
            console.log(`Updated jobs.json file`);

            return uniqueId;
        } else {
            console.log(`Could not find cron job with unique_id ${uniqueId}`);
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default deleteCronJob;