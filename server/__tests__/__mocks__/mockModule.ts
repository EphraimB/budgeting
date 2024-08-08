import { jest, describe, it, expect } from '@jest/globals';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../src/utils/helperFunctions';
import { beforeEach } from 'node:test';

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

    poolResponses.forEach((response) => {
        pool.mockImplementationOnce(() => Promise.resolve({ rows: response }));
    });

    jest.mock('../../src/utils/helperFunctions.js', () => ({
        handleError,
        parseIntOrFallback,
        parseFloatOrFallback,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));

    jest.mock('../../src/config/db.js', () => ({
        connect: jest.fn(() => ({
            query: jest.fn(() => ({
                rows: poolResponses[0],
            })),
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
        const poolResponses = [[{ id: 1 }]];

        mockModule(poolResponses);

        const db = require('../../src/config/db.js');

        // Trigger the mock pool query for the first response
        const { rows } = await db.connect().query();
        expect(rows).toEqual([{ id: 1 }]);
    });
});
