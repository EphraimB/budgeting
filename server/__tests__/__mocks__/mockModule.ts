import { jest, describe, it, expect } from '@jest/globals';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../src/utils/helperFunctions';

/**
 *
 * @param executeQueryResponses - Array of responses for executeQuery
 * @param handleErrorResponses - Array of responses for handleError
 * @param scheduleQueryResponses - Array of responses for scheduleQuery
 * @param unscheduleQueryResponses - Array of responses for unscheduleQuery
 * Mock module with mock implementations for executeQuery, handleError, scheduleQuery, and unscheduleQuery
 */
export const mockModule = (
    executeQueryResponses: any = [], // Array of responses for executeQuery
    handleErrorResponses: any = [], // Array of responses for handleError
    scheduleQueryResponses: any = [], // Array of responses for scheduleQuery
    unscheduleQueryResponses: any = [], // Array of responses for unscheduleQuery
) => {
    const executeQuery = jest.fn();
    const handleError = jest.fn();
    const scheduleQuery = jest.fn();
    const unscheduleQuery = jest.fn();

    // Set up mock implementations for executeQuery
    executeQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            executeQuery.mockImplementationOnce(() => Promise.reject(response));
        } else {
            executeQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for handleError
    handleErrorResponses.forEach((response: any) => {
        handleError.mockImplementationOnce((res: any, message: any) => {
            res.status(response.status || 400).json({
                message: response.message || message,
            });
        });
    });

    // Set up mock implementations for scheduleQuery
    scheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for unscheduleQuery
    unscheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError,
        scheduleQuery,
        unscheduleQuery,
        parseIntOrFallback,
        parseFloatOrFallback,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));
};

describe('Testing mockModule', () => {
    it('should return a module with mock implementations', () => {
        const executeQueryResponses = [new Error('Error')];
        const handleErrorResponses = [{ status: 500, message: 'Error' }];
        const scheduleQueryResponses = [new Error('Error')];
        const unscheduleQueryResponses = [new Error('Error')];

        mockModule(
            executeQueryResponses,
            handleErrorResponses,
            scheduleQueryResponses,
            unscheduleQueryResponses,
        );

        const {
            executeQuery,
            handleError,
            scheduleQuery,
            unscheduleQuery,
        } = require('../../utils/helperFunctions.js');

        expect(executeQuery).toBeDefined();
        expect(handleError).toBeDefined();
        expect(scheduleQuery).toBeDefined();
        expect(unscheduleQuery).toBeDefined();
    });
});
