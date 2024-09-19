import { jest } from '@jest/globals';
import { beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import dayjs from 'dayjs';
import mockDate from 'mockdate';
import { Timeslots } from '../../src/types/types.js';

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

describe('Compare timeslots', () => {
    it('should detect if a timeslot needs inserting', async () => {
        const currentTimeslots = [
            {
                id: 1,
                fareDetailId: 1,
                dayOfWeek: 0,
                startTime: '00:00:00',
                endTime: '05:00:00',
            },
        ];

        const incomingTimeslots = [
            {
                id: 1,
                fareDetailId: 1,
                dayOfWeek: 0,
                startTime: '00:00:00',
                endTime: '05:00:00',
            },
            {
                id: 2,
                fareDetailId: 1,
                dayOfWeek: 1,
                startTime: '00:00:00',
                endTime: '05:00:00',
            },
        ];

        const { compareTimeslots } = await import(
            '../../src/utils/helperFunctions'
        );

        // Call the function with the mock request and response
        const result = compareTimeslots(currentTimeslots, incomingTimeslots);

        // Assert
        expect(result).toStrictEqual({
            toInsert: [
                {
                    id: 2,
                    fareDetailId: 1,
                    dayOfWeek: 1,
                    startTime: '00:00:00',
                    endTime: '05:00:00',
                },
            ],
            toDelete: [],
            toUpdate: [],
        });
    });

    it('should detect if a timeslot needs deleting', async () => {
        const currentTimeslots: Timeslots[] = [
            {
                id: 1,
                fareDetailId: 1,
                dayOfWeek: 0,
                startTime: '00:00:00',
                endTime: '05:00:00',
            },
        ];

        const incomingTimeslots: Timeslots[] = [];

        const { compareTimeslots } = await import(
            '../../src/utils/helperFunctions'
        );

        // Call the function with the mock request and response
        const result = compareTimeslots(currentTimeslots, incomingTimeslots);

        // Assert
        expect(result).toStrictEqual({
            toInsert: [],
            toDelete: [
                {
                    id: 1,
                    fareDetailId: 1,
                    dayOfWeek: 0,
                    startTime: '00:00:00',
                    endTime: '05:00:00',
                },
            ],
            toUpdate: [],
        });
    });
});
