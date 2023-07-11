import { exec } from 'child_process';

/**
 * Delete a cron job by its unique ID.
 * 
 * @param uniqueId - The unique ID of the cron job.
 * @returns A promise that resolves when the job has been deleted, or rejects if an error occurred.
 */
const deleteCronJob = (uniqueId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // List all cron jobs
        exec('crontab -l', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            // Split the output into lines
            const lines = stdout.split('\n');

            // Filter out the line with the given unique ID
            const newLines = lines.filter(line => !line.includes(uniqueId));

            // Write the new lines back to the crontab
            exec(`echo "${newLines.join('\n')}" | crontab -`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    });
};

export default deleteCronJob;
