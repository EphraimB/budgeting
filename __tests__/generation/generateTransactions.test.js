import { jest } from '@jest/globals';
import generateTransactions from '../../generation/generateTransactions';
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set('2023-07-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('generateTransactions', () => {
    it('should process transactions correctly', () => {
        // setup your data
        const mockRequest = {
            query: {
                from_date: '2023-07-01',
                to_date: '2023-08-01',
                account_id: 1,
            },
            currentBalance: 500,
            transaction: [
                // ... fill with your transaction data ...
            ],
            expenses: [
                // ... fill with your expenses data ...
            ],
            payrolls: [
                // ... fill with your payrolls data ...
            ],
            loans: [
                // ... fill with your loans data ...
            ],
            transfers: [
                // ... fill with your transfers data ...
            ],
            wishlists: [
                // ... fill with your wishlists data ...
            ],
        };

        const mockResponse = {};
        const next = jest.fn();

        // Call your function with the mock data
        generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toBeCalled();

        // assert that the transactions were processed correctly
        expect(mockRequest.transactions).toEqual(
            // put your expected output here
        );

        // assert that the current balance was updated correctly
        expect(mockRequest.currentBalance).toBe(
            // put your expected output here
        );

        // you can also make assertions about how your mocked functions were called
        expect(generateDailyExpenses).toBeCalledWith(
            // put your expected arguments here
        );
        // ... do this for other mocked functions as well ...
    });
});
