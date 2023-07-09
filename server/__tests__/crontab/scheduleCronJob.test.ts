import { exec as execMock } from 'child_process';
import scheduleCronJob from '../../crontab/scheduleCronJob';
import determineCronValues from '../../crontab/determineCronValues';

jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

jest.mock('../../crontab/determineCronValues', () => jest.fn());

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

        (determineCronValues as jest.Mock).mockReturnValue(expectedCronDate);
        (execMock as jest.Mock).mockImplementation((command, callback) => callback(null, '', ''));

        // Act
        const result = await scheduleCronJob(jobDetails);

        // Assert
        expect(determineCronValues).toHaveBeenCalledWith(expect.objectContaining({ date: jobDetails.date, frequency_type: jobDetails.frequency_type }));
        expect(execMock as jest.Mock).toHaveBeenCalledWith(expect.stringContaining(expectedCronDate), expect.any(Function));
        expect(result).toEqual({ cronDate: expectedCronDate, uniqueId: expect.any(String) });
    });
});
