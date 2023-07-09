import { exec } from 'child_process';
import determineCronValues from './determineCronValues';
import { v4 as uuidv4 } from 'uuid';

/**
 * @param jobDetails - Job details
 * @returns - Cron job data
 */
const scheduleCronJob = async (jobDetails: any) => {
    const { date,
        account_id,
        amount,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year } = jobDetails;

    const uniqueId: string = uuidv4();

    // You should replace this with the path to your Bash script that the cron job will run
    const yourScriptPath: string = "/path/to/your/script.sh";

    // Determine the cron values based on the job details
    const cronDate = determineCronValues({ date, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year });

    // Build the cron command that will execute the Bash script
    const cronCommand = `${yourScriptPath} --account_id ${account_id} --amount ${amount} --description ${description}`;

    // Add a new cron job to the system crontab
    exec(
        `(crontab -l ; echo "${cronDate} ${cronCommand}") | crontab -`,
        (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`Error setting up cron job: ${error}`);
                return;
            }
            console.log(`Cron job set up successfully!`);
        }
    );

    return {
        cronDate,
        uniqueId,
    };
};

export default scheduleCronJob;
