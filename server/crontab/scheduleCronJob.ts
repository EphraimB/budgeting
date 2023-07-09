import { exec } from 'child_process';
import determineCronValues from './determineCronValues';
import { v4 as uuidv4 } from 'uuid';

/**
 * 
 * @param jobDetails - Job details
 * @returns - Cron job data
 */
const scheduleCronJob = async (jobDetails: any) => {
    const uniqueId: string = uuidv4();

    // You should replace this with the path to your Node.js script that the cron job will run
    const yourScriptPath: string = "/path/to/your/script.js";

    // add a new cron job to the system crontab
    exec(`(crontab -l ; echo "${determineCronValues} node ${yourScriptPath}") | crontab -`, (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
            console.error(`Error setting up cron job: ${error}`);
            return;
        }
        console.log(`Cron job set up successfully!`);
    });

    return {
        cronDate: determineCronValues,
        uniqueId: uniqueId
    };
};

export default scheduleCronJob;
