import { exec } from 'child_process';
import { CronJobData, JobOptions, determineCronValues, createCronJob } from './yourOtherFunctions';
import { v4 as uuidv4 } from 'uuid';

/**
 * 
 * @param jobDetails - Job details
 * @returns - Cron job data
 */
const scheduleCronJob = async (jobDetails: CronJobData) => {
    const uniqueId = uuidv4();
    const newJob = createCronJob(jobDetails, uniqueId);

    // You should replace this with the path to your Node.js script that the cron job will run
    const yourScriptPath = "/path/to/your/script.js";

    // add a new cron job to the system crontab
    exec(`(crontab -l ; echo "${newJob.cron} node ${yourScriptPath}") | crontab -`, (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
            console.error(`Error setting up cron job: ${error}`);
            return;
        }
        console.log(`Cron job set up successfully!`);
    });

    return {
        cronDate: newJob.cron,
        uniqueId: newJob.name
    };
};

export default scheduleCronJob;
