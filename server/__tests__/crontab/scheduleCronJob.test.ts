import { exec, ChildProcess } from 'child_process';
import scheduleCronJob from '../../crontab/scheduleCronJob';
import determineCronValues from '../../crontab/determineCronValues';

jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

jest.mock('../../crontab/determineCronValues', () => jest.fn());

// Explicitly declare the types of the mocked functions
const execMock = exec as jest.MockedFunction<typeof exec>;
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
        execMock.mockImplementation((...args): ChildProcess => {
            const callback = args.find(arg => typeof arg === 'function');
            if (typeof callback === 'function') {
                callback(null, '', '');
            }
            return {} as ChildProcess; // Return a mock ChildProcess object
        });

        // Act
        const result = await scheduleCronJob(jobDetails);

        // Assert
        expect(determineCronValuesMock).toHaveBeenCalledWith(expect.objectContaining({ date: jobDetails.date, frequency_type: jobDetails.frequency_type }));
        expect(execMock).toHaveBeenCalledWith(expect.stringContaining(expectedCronDate), expect.any(Function));
        expect(result).toEqual({ cronDate: expectedCronDate, uniqueId: expect.any(String) });
    });
});
