import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../src/utils/helperFunctions';

/**
 *
 * @param poolResponses - Array of responses for the database client
 * @param camelCaseResponse - Response of the toCamelCase function
 * @param isTimeWithinRangeResponse - Either true or false for if the time is in range
 * Mock module with mock implementations for the database client and handleError
 */
export const mockModule = (
    poolResponses: any[], // Array of responses for the database client
    camelCaseResponse?: any,
    isTimeWithinRangeResponse?: boolean,
) => {
    const pool = jest.fn();
    const handleError = jest.fn();

    poolResponses.forEach((response, index) => {
        pool.mockImplementationOnce(() =>
            Promise.resolve({ rows: response[index] }),
        );
    });

    jest.mock('../../src/utils/helperFunctions.js', () => ({
        toCamelCase: jest.fn(() => camelCaseResponse),
        handleError,
        parseIntOrFallback,
        parseFloatOrFallback,
        isTimeWithinRange: jest.fn(() => isTimeWithinRangeResponse),
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

    it('should return the second parameter from mockModule for toCamelCase', async () => {
        const poolResponses = [[{ id: 1 }], [{ id: 2 }]];

        mockModule(poolResponses, [{ id: 3 }]);

        const { toCamelCase } = require('../../src/utils/helperFunctions');

        const retreivedRows = toCamelCase(); // Convert to camelCase

        expect(retreivedRows).toEqual([{ id: 3 }]);
    });

    it('should return the third parameter for mockModule for isTimeWithinRange', async () => {
        mockModule([], [], true);

        const {
            isTimeWithinRange,
        } = require('../../src/utils/helperFunctions');

        const expectedResponse = isTimeWithinRange();

        expect(expectedResponse).toEqual(true);
    });
});
