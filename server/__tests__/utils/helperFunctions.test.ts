import { jest } from '@jest/globals';
import { beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import dayjs from 'dayjs';
import mockDate from 'mockdate';

// Define the type for the function that is being mocked
type MyQueryFunction = (sql: string, params: any[]) => Promise<{ rows: any[] }>;

// Mocking db.js module
jest.mock('../../src/config/db.js', () => {
    return {
        query: jest
            .fn<MyQueryFunction>()
            .mockResolvedValueOnce({ rows: [{ id: 1, name: 'John Doe' }] }) // Success case
            .mockRejectedValueOnce(new Error('Table does not exist')), // Failure case
    };
});

global.fetch = jest.fn((input: RequestInfo, init?: RequestInit | undefined) =>
    Promise.resolve(new Response(JSON.stringify({ id: 1, name: 'John Doe' }))),
) as jest.MockedFunction<any>;

// Mock request and response
let mockResponse: any;

beforeEach(() => {
    mockResponse = {
        status: jest.fn(() => mockResponse),
        send: jest.fn(),
    };

    // Mock current date
    mockDate.set('2021-01-01');
});

afterEach(() => {
    jest.resetModules();

    // Reset current date
    mockDate.reset();
});

describe('handleError function', () => {
    it('should send a 500 error with the correct error message', async () => {
        const { handleError } = await import('../../src/utils/helperFunctions');

        handleError(mockResponse, 'Test error message');

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith('Test error message');
    });
});

describe('parseOrFallback function', () => {
    it('should return the parsed input', async () => {
        const { parseIntOrFallback } = await import(
            '../../src/utils/helperFunctions'
        );

        const mockInput = '1';
        const result = parseIntOrFallback(mockInput);
        expect(result).toEqual(1);
    });

    it('should return null if the input is null', async () => {
        const { parseIntOrFallback } = await import(
            '../../src/utils/helperFunctions'
        );

        const mockInput = null;
        const result = parseIntOrFallback(mockInput);
        expect(result).toBeNull();
    });

    it('should return null if the input is undefined', async () => {
        const { parseIntOrFallback } = await import(
            '../../src/utils/helperFunctions'
        );

        const mockInput = undefined;
        const result = parseIntOrFallback(mockInput);
        expect(result).toBeNull();
    });

    it('should return null if the input is not a number', async () => {
        const { parseIntOrFallback } = await import(
            '../../src/utils/helperFunctions'
        );

        const mockInput = 'not a number';
        const result = parseIntOrFallback(mockInput);
        expect(result).toBeNull();
    });
});

describe('nextTransactionFrequencyDate function', () => {
    it('should return the next transaction frequency date on a regular monthly', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 2,
            frequency_type_variable: 1,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2021-01-15T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a regular weekly', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 1,
            frequency_type_variable: 1,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2020-12-22T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a regular daily', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 0,
            frequency_type_variable: 1,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2020-12-16T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a daily every other day', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 0,
            frequency_type_variable: 2,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2020-12-17T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a regular yearly', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 3,
            frequency_type_variable: 1,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2021-12-15T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a weekly with a specific day', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: 3,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2020-12-23T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a weekly every other week', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 1,
            frequency_type_variable: 2,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2020-12-29T00:00:00-05:00');
    });

    it('should return the next transaction frequency date on a yearly with a specific day and month', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 3,
            frequency_type_variable: 1,
            begin_date: '2020-12-15',
            frequency_month_of_year: 10,
            frequency_day_of_week: 3,
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2021-11-17T00:00:00-05:00');
    });

    it('should return the begin date if it is in the future', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 2,
            frequency_type_variable: 1,
            begin_date: '2022-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toEqual('2022-12-15');
    });

    it('should return null if the frequency type is invalid', async () => {
        const { nextTransactionFrequencyDate } = await import(
            '../../src/utils/helperFunctions'
        );

        const transaction = {
            frequency_type: 4,
            frequency_type_variable: 1,
            begin_date: '2020-12-15',
        };

        const result = nextTransactionFrequencyDate(transaction);
        expect(result).toBeNull();
    });
});
