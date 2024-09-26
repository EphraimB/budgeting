import determineCronValues from '../../src/crontab/determineCronValues.js';
import { describe, it, expect } from '@jest/globals';

describe('determineCronValues', () => {
    it('should determine cron values correctly for frequency type 0', () => {
        const jobDetails = {
            frequencyType: 0,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 */1 * * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 1', () => {
        const jobDetails = {
            frequencyType: 1,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 */7 * * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 1 with day of week', () => {
        const jobDetails = {
            frequencyType: 1,
            frequencyTypeVariable: 2,
            frequencyDayOfWeek: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 * * 3 ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2', () => {
        const jobDetails = {
            frequencyType: 2,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 11 */1 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2 with day of week', () => {
        const jobDetails = {
            frequencyType: 2,
            frequencyDayOfWeek: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 * * 3 ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2 with week of month', () => {
        const jobDetails = {
            frequencyType: 2,
            frequencyDayOfWeek: 3,
            frequencyWeekOfMonth: 1,
            date: '2023-07-11T12:00:00.000Z',
        };

        const cronWeekOfMonthExpression = `[ "$(date +%m)" != "$(date +%m -d '1 week')" ] &&`;

        const expectedCronDate = `0 8 * * 3 ${cronWeekOfMonthExpression}`;
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 2 with day of month', () => {
        const jobDetails = {
            frequencyType: 2,
            frequencyTypeVariable: 2,
            frequencyDayOfMonth: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 3 */2 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3', () => {
        const jobDetails = {
            frequencyType: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 11 */12 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3 with day of week', () => {
        const jobDetails = {
            frequencyType: 3,
            frequencyDayOfWeek: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 * * 3 ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3 with week of month', () => {
        const jobDetails = {
            frequencyType: 3,
            frequencyDayOfWeek: 3,
            frequencyWeekOfMonth: 1,
            date: '2023-07-11T12:00:00.000Z',
        };

        const cronWeekOfMonthExpression = `[ "$(date +%m)" != "$(date +%m -d '1 week')" ] &&`;

        const expectedCronDate = `0 8 * * 3 ${cronWeekOfMonthExpression}`;
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });

    it('should determine cron values correctly for frequency type 3 with day of month', () => {
        const jobDetails = {
            frequencyType: 3,
            frequencyDayOfMonth: 3,
            date: '2023-07-11T12:00:00.000Z',
        };

        const expectedCronDate = '0 8 3 */12 * ';
        const actualCronDate = determineCronValues(jobDetails);

        expect(actualCronDate).toBe(expectedCronDate);
    });
});
