import { generateCommuteExpenses } from '../../generation/generateCommuteExpenses';
import MockDate from 'mockdate';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import dayjs, { Dayjs } from 'dayjs';

beforeAll(() => {
    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('generateCommuteExpenses', () => {
    it('should generate correct transactions for given inputs', () => {
        const commuteExpenseSample = {
            commute_schedule_id: 1,
            commute_system_id: 1,
            account_id: 1,
            fare_detail_id: 1,
            duration: 1,
            day_of_week: 4, // Wednesday
            start_time: '08:00',
            pass: 'Sample Pass',
            fare_amount: 100,
            timed_pass_duration: null,
            date_created: '2021-01-01',
            date_modified: '2021-01-01',
        };

        const fromDate: Dayjs = dayjs('2020-01-01');
        const toDate: Dayjs = dayjs('2021-01-15');

        const result = generateCommuteExpenses(
            commuteExpenseSample,
            toDate,
            fromDate,
        );

        // Add assertions based on expected result
        expect(result.length).toBeGreaterThan(0); // As a basic assertion
        // More specific assertions can be:
        expect(result[0].amount).toEqual(-100);
        expect(result[0].title).toEqual('Sample Pass');
        expect(result[0].description).toEqual('Sample Pass pass');
        expect(result[0].date).toEqual(new Date('2020-01-02 08:00'));
        expect(result[0].total_amount).toEqual(-100);
        expect(result[0].tax_rate).toEqual(0);
    });
});
