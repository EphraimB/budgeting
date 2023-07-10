import determineCronValues from '../../crontab/determineCronValues';

describe('determineCronValues', () => {
    it('should return correct cron date for frequency type 0', () => {
        const jobDetails = {
            date: '2021-01-01T00:00:00.000Z',
            frequency_type: 0,
            frequency_type_variable: 2,
        };

        const result = determineCronValues(jobDetails);

        expect(result).toEqual('0 0 */2 * *');
    });

    it('should return correct cron date for frequency type 1', () => {
        const jobDetails = {
            date: '2021-01-01T00:00:00.000Z',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: 5,
            frequency_day_of_month: 10,
        };

        const result = determineCronValues(jobDetails);

        expect(result).toEqual('0 0 10 * 5');
    });

    // Add more tests for other frequency types and edge cases...
});
