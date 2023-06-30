import { jest } from '@jest/globals';
import { Volume } from 'memfs';

const vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': '',
}, '/app');

jest.unstable_mockModule('fs', () => ({
    default: vol,
}));

jest.unstable_mockModule('../../../bree/breeManager.js', () => ({
    getBree: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        start: jest.fn(),
    })),
}));

const scheduleCronJobModule = await import('../../../bree/jobs/scheduleCronJob.js');
const scheduleCronJob = scheduleCronJobModule.default;

describe('scheduleCronJob', () => {
    it('gets back the cron date', async () => {
        const jobDetails = {
            account_id: 1,
            amount: 500.00,
            description: 'Testing',
            begin_date: '2021-07-19T13:30',
            frequency_type: 2
        };

        const { cronDate } = await scheduleCronJob(jobDetails, '/app/cron-jobs/jobs.js', '/app/jobs.json');

        // Specify expected values here
        const expectedCronDate = '30 13 19 */1 *'; // Provide the expected cronDate

        expect(cronDate).toBe(expectedCronDate);
    });

    it('Gets back a cron date with a yearly frequency', async () => {
        const jobDetailsYearly = {
            account_id: 1,
            amount: 500.00,
            description: 'Testing',
            begin_date: '2021-07-19T13:30',
            frequency_type: 3
        };

        const { cronDate } = await scheduleCronJob(jobDetailsYearly, '/app/cron-jobs/jobs.js', '/app/jobs.json');

        // Specify expected values here
        const expectedCronDate = '30 13 19 */12 *'; // Provide the expected cronDate

        expect(cronDate).toBe(expectedCronDate);
    });

    it('Gets back a cron date with a unique frequency', async () => {
        const jobDetailsUnique = {
            account_id: 1,
            amount: 500.00,
            description: 'Testing',
            begin_date: '2021-07-19T13:30',
            frequency_type: 1,
            frequency_type_variable: 2
        };

        const { cronDate } = await scheduleCronJob(jobDetailsUnique, '/app/cron-jobs/jobs.js', '/app/jobs.json');

        // Specify expected values here
        const expectedCronDate = '30 13 */14 * *'; // Provide the expected cronDate

        expect(cronDate).toBe(expectedCronDate);
    });

    it('Gets back a cron date with a day of week', async () => {
        const jobDetailsUnique = {
            account_id: 1,
            amount: 500.00,
            description: 'Testing',
            begin_date: '2021-07-19T13:30',
            frequency_type: 2,
            frequency_day_of_week: 1
        };

        const { cronDate } = await scheduleCronJob(jobDetailsUnique, '/app/cron-jobs/jobs.js', '/app/jobs.json');

        // Specify expected values here
        const expectedCronDate = '30 13 * * 1'; // Provide the expected cronDate

        expect(cronDate).toBe(expectedCronDate);
    });
});
