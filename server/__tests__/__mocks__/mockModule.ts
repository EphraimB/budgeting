import { jest, describe, it, expect } from '@jest/globals';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../src/utils/helperFunctions';

/**
 *
 * @param poolResponses - Array of responses for the database client
 * Mock module with mock implementations for the database client and handleError
 */
export const mockModule = (
    poolResponses: any[], // Array of responses for the database client
) => {
    const pool = jest.fn();
    const handleError = jest.fn();

    if (poolResponses === undefined) {
        pool.mockImplementationOnce(() =>
            Promise.reject({ status: 400, message: 'Error' }),
        );
    } else {
        poolResponses.forEach((response: any[]) => {
            pool.mockImplementationOnce(() => Promise.resolve(response));
        });
    }

    jest.mock('../../src/utils/helperFunctions.js', () => ({
        handleError,
        parseIntOrFallback,
        parseFloatOrFallback,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));

    jest.mock('../../src/config/db.js', () => ({
        connect: jest.fn(() => ({
            query: jest.fn(() => ({
                rows: poolResponses,
            })),
            release: jest.fn(),
        })),
    }));
};

describe('Testing mockModule', () => {
    it('should return a module with mock implementations', async () => {
        const poolResponses = [{ rows: [{ id: 1 }] }];

        mockModule([poolResponses]);

        const { handleError } = require('../../src/utils/helperFunctions.js');
        const db = require('../../src/config/db.js');

        // Create mock response and request objects
        const res: any = {
            status: poolResponses,
            json: jest.fn(),
        };

        // Trigger the mock error handling
        handleError(res, 'Test error message');

        // Assert that the handleError function was called correctly
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error' });

        // Trigger the mock pool query and assert the results
        try {
            await db.connect().query();
        } catch (error) {
            expect(error.message).toBe('Error');
        }

        // Trigger the mock pool query with a successful response
        const result = await db.connect().query();
        expect(result).toEqual({ rows: [{ id: 1 }] });
    });
});
