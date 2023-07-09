import { exec } from 'child_process';
import determineCronValues from './determineCronValues';
import { v4 as uuidv4 } from 'uuid';

/**
 * @param jobDetails - Job details
 * @returns - Cron job data
 */
const scheduleCronJob = async (jobDetails: any) => {
    const uniqueId: string = uuidv4();

    // You should replace this with the path to your Bash script that the cron job will run
    const yourScriptPath: string = "/path/to/your/script.sh";

    // Determine the cron values based on the job details
    const { cronDay, cronMonth, cronDayOfWeek } = determineCronValues(jobDetails);

    // Build the cron command that will execute the Bash script
    const cronCommand = `${yourScriptPath} --arg1 value1 --arg2 value2`;

    // Add a new cron job to the system crontab
    exec(
        `(crontab -l ; echo "${cronDay} ${cronMonth} ${cronDayOfWeek} ${cronCommand}") | crontab -`,
        (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`Error setting up cron job: ${error}`);
                return;
            }
            console.log(`Cron job set up successfully!`);
        }
    );

    return {
        cronDate: { cronDay, cronMonth, cronDayOfWeek },
        uniqueId: uniqueId,
    };
};

export default scheduleCronJob;
