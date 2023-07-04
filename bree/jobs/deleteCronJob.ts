import { getBree } from '../breeManager.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import pool from '../../config/db.js';
import { cronJobQueries } from '../../models/queryData.js';
import { JobOptions } from 'bree';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * 
 * @param cronId - The cron job id
 * @param [filePath] - The path to the cron job file
 * @param [jobsFilePath]- The path to the jobs.json file
 * @returns - The unique_id of the deleted cron job
 */
const deleteCronJob = async (cronId: number, filePath?: string, jobsFilePath?: string): Promise<string | null> => {
    try {
        const results = await pool.query(cronJobQueries.getCronJob, [cronId]);
        const uniqueId: string = results.rows[0].unique_id;

        filePath = filePath || path.join(__dirname, 'cron-jobs', `${uniqueId}.js`);
        jobsFilePath = jobsFilePath || path.join(__dirname, '../jobs.json');

        const jobToDelete: JobOptions = getBree().config.jobs.find((job: JobOptions) => job.name === uniqueId);
        if (jobToDelete) {
            getBree().remove(jobToDelete.name);
            console.log(`Deleted cron job with unique_id ${uniqueId}`);

            await fs.promises.unlink(filePath);
            console.log(`Deleted cron job file ${uniqueId}.js`);

            const data = await fs.promises.readFile(jobsFilePath, 'utf8');
            const jobs = JSON.parse(data);
            const updatedJobs: JobOptions[] = jobs.filter((job: JobOptions) => job.name !== uniqueId && job.name !== 'payroll-checker');
            await fs.promises.writeFile(jobsFilePath, JSON.stringify(updatedJobs, null, 2));
            console.log('Updated jobs.json file');

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
