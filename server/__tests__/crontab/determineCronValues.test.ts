import determineCronValues from '../../crontab/determineCronValues.js';

describe('determineCronValues', () => {
    it('should determine cron values correctly for frequency type 0', () => {
        const jobDetails = {
            frequency_type: 0,
            frequency_type_variable: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 */3 * *';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 1 with day of week', () => {
        const jobDetails = {
            frequency_type: 1,
            frequency_type_variable: 2,
            frequency_day_of_week: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 * * 3';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    // Add more tests for different types and cases
});
