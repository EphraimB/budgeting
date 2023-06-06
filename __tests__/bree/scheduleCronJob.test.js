import { jest } from '@jest/globals';
import scheduleCronJob from '../../jobs/scheduleCronJob';
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

vol.existsSync = jest.fn(vol.existsSync);
vol.readFileSync = jest.fn(vol.readFileSync);
vol.writeFileSync = jest.fn(vol.writeFileSync);

let mockBree, mockGetBree;

describe('scheduleCronJob', () => {
    beforeAll(async () => {
        mockBree = {
            add: jest.fn(),
            start: jest.fn(),
        };

        mockGetBree = jest.fn().mockReturnValue(mockBree);
    });

    it('schedules a new job successfully', async () => {
        const { cronDate, uniqueId } = await scheduleCronJob(jobDetails, mockGetBree, vol, '/app/cron-jobs/jobs.js', '/app/jobs.json');

        // Specify expected values here
        const expectedCronDate = '30 13 19 */1 *'; // Provide the expected cronDate

        expect(cronDate).toBe(expectedCronDate);

        // Test that all methods are called with correct parameters
        expect(vol.existsSync).toHaveBeenCalled();
        expect(vol.readFileSync).toHaveBeenCalled();
        expect(vol.writeFileSync).toHaveBeenCalled();
        expect(mockBree.add).toHaveBeenCalled();
        expect(mockBree.start).toHaveBeenCalledWith(uniqueId);
    });
});
