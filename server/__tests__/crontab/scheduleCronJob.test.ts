import { jest } from '@jest/globals';
import { Volume } from 'memfs';

const vol = Volume.fromJSON({
    '/tmp/cronjob.lock': '',
    '/scripts/createTransaction.sh': '',
}, '/app');

jest.mock('child_process', () => ({
    execSync: jest.fn(),
}));

jest.mock('proper-lockfile', () => ({
    lock: jest.fn(),
    unlock: jest.fn()
}));

jest.mock('../../crontab/determineCronValues.js', () => {
    return jest.fn().mockReturnValue('0 0 9 * *');
});

jest.mock('fs', () => ({
    default: vol
}));

describe('scheduleCronJob', () => {
    it('should schedule a cron job', async () => {
        const { default: scheduleCronJob } = await import('../../crontab/scheduleCronJob.js');

        // Arrange
        const jobDetails = {
            date: '2023-07-09',
            account_id: '1',
            id: '1',
            amount: '100',
            description: 'Test',
            frequency_type: '1',
            scriptPath: '/app/scripts/createTransaction.sh',
            type: 'test'
        };

        // Act
        const result = await scheduleCronJob(jobDetails);

        // Assert
        expect(result).toEqual({ cronDate: '0 0 9 * *', uniqueId: expect.stringMatching(/^test_.*/) });
    });
});
