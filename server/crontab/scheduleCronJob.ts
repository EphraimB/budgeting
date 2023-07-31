import { execSync } from 'child_process';
import determineCronValues from './determineCronValues.js';
import { v4 as uuidv4 } from 'uuid';
import { lock, unlock } from 'proper-lockfile';

/**
 * @param jobDetails - Job details
 * @returns Cron job data
 */
const scheduleCronJob = async (jobDetails: any) => {
    const { date,
        account_id,
        id,
        destination_account_id,
        title,
        amount,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        scriptPath,
        type } = jobDetails;

    const uniqueId: string = `${type}_${uuidv4()}`;

    // Determine the cron values based on the job details
    const cronDate = determineCronValues({ date, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year });

    // Build the cron command that will execute the Bash script
    const cronCommand = `${scriptPath} ${uniqueId} ${account_id} ${id} ${amount} "${title}" "${description}" ${destination_account_id ? destination_account_id : ''} `;

    // Add a new cron job to the system crontab
    let release;

    try {
        // Add a new cron job to the system crontab
        release = await lock('/app/tmp/cronjob.lock');

        try {
            execSync(`(crontab -l ; echo '${cronDate} ${cronCommand} > /app/cron.log 2>&1') | crontab - `);
            console.log(`Cron job set up successfully!`);
        } catch (error) {
            console.error(`Error setting up cron job: ${error} `);
        }
    } catch (err) {
        console.error('Failed to acquire lock or encountered an error: ', err);
    } finally {
        if (release) {
            try {
                await release();
            } catch (err) {
                console.error('Failed to release lock: ', err);
            }
        }
    }

    return {
        cronDate,
        uniqueId,
    };
};

export default scheduleCronJob;
