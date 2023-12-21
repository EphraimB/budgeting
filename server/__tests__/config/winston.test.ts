import { logger } from '../../config/winston';
import { jest, afterEach, describe, it, expect } from '@jest/globals';

// Mock Winston's transports so logs aren't actually written during tests
jest.mock('winston', () => {
    const mFormat = {
        combine: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
        errors: jest.fn(),
        json: jest.fn(),
        splat: jest.fn(),
        prettyPrint: jest.fn(),
    };
    const mTransports = {
        Console: jest.fn().mockReturnThis(),
        File: jest.fn().mockReturnThis(),
    };
    const mLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    };
    return {
        createLogger: jest.fn().mockReturnValue(mLogger),
        format: mFormat,
        transports: mTransports,
    };
});

describe('Logger', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should log error', () => {
        logger.error('test error');
        expect(logger.error).toHaveBeenCalledWith('test error');
    });

    it('should log info', () => {
        logger.info('test info');
        expect(logger.info).toHaveBeenCalledWith('test info');
    });
});
