import { jest } from '@jest/globals';
import { execSync } from 'child_process';
import { lock, unlock } from 'proper-lockfile';
import scheduleCronJob from '../../crontab/scheduleCronJob';
import determineCronValues from '../../crontab/determineCronValues';

jest.mock('child_process', () => ({
    execSync: jest.fn(),
}));

jest.mock('proper-lockfile', () => ({
    lock: jest.fn(),
    unlock: jest.fn(),
}));

jest.mock('../../crontab/determineCronValues', () => jest.fn());

// Explicitly declare the types of the mocked functions
const execSyncMock = execSync as jest.MockedFunction<typeof execSync>;
const lockMock = lock as jest.MockedFunction<typeof lock>;
const unlockMock = unlock as jest.MockedFunction<typeof unlock>;
const determineCronValuesMock = determineCronValues as jest.MockedFunction<typeof determineCronValues>;

describe('scheduleCronJob', () => {
    it('should schedule a cron job', async () => {
        // Arrange
        const jobDetails = {
            date: '2023-07-09',
            account_id: '1',
            amount: '100',
            description: 'Test',
            frequency_type: '1',
            scriptPath: '/path/to/script',
        };
        const expectedCronDate = '* * * * *';
        const expectedUniqueId = '1234';

        determineCronValuesMock.mockReturnValue(expectedCronDate);
        lockMock.mockResolvedValue(() => Promise.resolve());

        // Act
        const result = await scheduleCronJob(jobDetails);

        // Assert
        expect(determineCronValuesMock).toHaveBeenCalledWith(expect.objectContaining({ date: jobDetails.date, frequency_type: jobDetails.frequency_type }));
        expect(execSyncMock).toHaveBeenCalledWith(expect.stringContaining(`(crontab -l ; echo '${expectedCronDate}`));
        expect(lockMock).toHaveBeenCalledWith('/app/tmp/cronjob.lock');
        expect(result).toEqual({ cronDate: expectedCronDate, uniqueId: expect.any(String) });
    });
});
