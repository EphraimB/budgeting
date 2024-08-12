import { jest, describe, it, expect } from '@jest/globals';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../src/utils/helperFunctions';
import { beforeEach } from '@jest/globals';

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

    poolResponses.forEach((response, index) => {
        pool.mockImplementationOnce(() =>
            Promise.resolve({ rows: response[index] }),
        );
    });

    jest.mock('../../src/utils/helperFunctions.js', () => ({
        handleError,
        parseIntOrFallback,
        parseFloatOrFallback,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));

    let callCount = 0;

    jest.mock('../../src/config/db.js', () => ({
        connect: jest.fn(() => ({
            query: jest.fn(() => {
                const response = poolResponses[callCount];
                callCount++;
                return { rows: response };
            }),
            release: jest.fn(),
        })),
    }));
};

describe('Testing mockModule', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return a module with mock implementations', async () => {
        const poolResponses = [[{ id: 1 }], [{ id: 2 }]];

        mockModule(poolResponses);

        const db = require('../../src/config/db.js');

        // Trigger the mock pool query for the first response
        const { rows } = await db.connect().query();

        // Trigger the mock pool query for the second response
        const { rows: secondRow } = await db.connect().query();

        expect(rows).toEqual([{ id: 1 }]);
        expect(secondRow).toEqual([{ id: 2 }]);
    });
});
