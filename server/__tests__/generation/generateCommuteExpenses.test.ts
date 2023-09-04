import { generateCommuteExpenses } from '../../generation/generateCommuteExpenses';
import MockDate from 'mockdate';

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
            commute_ticket_id: 1,
            duration: 1,
            day_of_week: 4, // Wednesday
            start_time: '08:00',
            pass: 'Sample Pass',
            fare_amount: 100,
            date_created: '2021-01-01',
            date_modified: '2021-01-01',
        };

        const fromDate = new Date('2020-01-01');
        const toDate = new Date('2021-01-15');

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