import determineCronValues from '../../crontab/determineCronValues.js';

describe('determineCronValues', () => {
    it('should determine cron values correctly for frequency type 0', () => {
        const jobDetails = {
            frequency_type: 0,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 */1 * * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 1', () => {
        const jobDetails = {
            frequency_type: 1,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 */7 * * ';
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

        const expectedCronDate = '0 8 * * 3 ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2', () => {
        const jobDetails = {
            frequency_type: 2,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 11 */1 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2 with day of week', () => {
        const jobDetails = {
            frequency_type: 2,
            frequency_day_of_week: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 * * 3 ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2 with week of month', () => {
        const jobDetails = {
            frequency_type: 2,
            frequency_day_of_week: 3,
            frequency_week_of_month: 1,
            date: '2023-07-11T12:00:00.000Z',
        };

        const cronWeekOfMonthExpression = `[ \"$(date +%m)\" != \"$(date +%m -d '1 week')\" ] &&`;

        const expectedCronDate = `0 8 * * 3 ${cronWeekOfMonthExpression}`;
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2 with day of month', () => {
        const jobDetails = {
            frequency_type: 2,
            frequency_type_variable: 2,
            frequency_day_of_month: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 3 */2 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3', () => {
        const jobDetails = {
            frequency_type: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 11 */12 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3 with day of week', () => {
        const jobDetails = {
            frequency_type: 3,
            frequency_day_of_week: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 * * 3 ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3 with week of month', () => {
        const jobDetails = {
            frequency_type: 3,
            frequency_day_of_week: 3,
            frequency_week_of_month: 1,
            date: '2023-07-11T12:00:00.000Z',
        };

        const cronWeekOfMonthExpression = `[ \"$(date +%m)\" != \"$(date +%m -d '1 week')\" ] &&`;

        const expectedCronDate = `0 8 * * 3 ${cronWeekOfMonthExpression}`;
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3 with day of month', () => {
        const jobDetails = {
            frequency_type: 3,
            frequency_day_of_month: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 3 */12 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });
});
