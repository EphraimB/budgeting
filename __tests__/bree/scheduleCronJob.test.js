import { jest } from '@jest/globals';
import { Volume } from 'memfs';

const jobDetails = {
    account_id: 1,
    amount: 500.00,
    description: 'Testing',
    begin_date: '2021-07-19T13:30',
    frequency_type: 2
};

const vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': '',
}, '/app');

jest.unstable_mockModule('fs', () => ({
    default: vol,
}));

jest.unstable_mockModule('../../breeManager.js', () => ({
    getBree: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        start: jest.fn(),
    })),
}));

const scheduleCronJobModule = await import('../../jobs/scheduleCronJob.js');
const scheduleCronJob = scheduleCronJobModule.default;

describe('scheduleCronJob', () => {
    it('schedules a new job successfully', async () => {
        const { cronDate, uniqueId } = await scheduleCronJob(jobDetails, '/app/cron-jobs/jobs.js', '/app/jobs.json');

        // Specify expected values here
        const expectedCronDate = '30 13 19 */1 *'; // Provide the expected cronDate

        expect(cronDate).toBe(expectedCronDate);
    });
});
