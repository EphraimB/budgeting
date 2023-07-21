import { execSync } from 'child_process';
import { lock } from 'proper-lockfile';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync } from 'fs';

/**
 * Delete a cron job by its unique ID.
 * 
 * @param uniqueId - The unique ID of the cron job.
 * Promise that resolves when the cron job has been deleted.
 */
const deleteCronJob = async (uniqueId: string): Promise<void> => {
    try {
        // Acquire the lock
        const release = await lock('/app/tmp/cronjob.lock');

        try {
            // List all cron jobs
            const stdout = execSync('crontab -l').toString();

            // Split the output into lines
            const lines = stdout.split('\n');

            // Filter out the line with the given unique ID
            const newLines = lines.filter(line => !line.includes(uniqueId));

            // Generate a unique filename for the temporary crontab
            const tmpCronFile = `/app/tmp/cronjob.${uuidv4()}.tmp`;

            // Write the new lines to the temporary file
            writeFileSync(tmpCronFile, newLines.join('\n'));

            // Install the new crontab from the temporary file
            execSync(`crontab ${tmpCronFile}`);
        } catch (error) {
            console.error(`Error deleting cron job: ${error}`);
            throw error;
        } finally {
            // Release the lock
            await release();
        }
    } catch (err) {
        console.error('Failed to acquire or release lock');
        throw err;
    }
};

export default deleteCronJob;
