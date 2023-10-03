import { jest } from '@jest/globals';

// Define the type for the function that is being mocked
type MyQueryFunction = (sql: string, params: any[]) => Promise<{ rows: any[] }>;

// Mocking db.js module
jest.mock('../../config/db.js', () => {
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
});

afterEach(() => {
    jest.resetModules();
});

describe('handleError function', () => {
    it('should send a 500 error with the correct error message', async () => {
        const { handleError } = await import('../../utils/helperFunctions');

        handleError(mockResponse, 'Test error message');

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith('Test error message');
    });
});

describe('executeQuery function', () => {
    it('should execute the given query with the provided params', async () => {
        const { executeQuery } = await import('../../utils/helperFunctions');

        const mockQuery = 'SELECT * FROM accounts WHERE id = $1';
        const mockParams = [1];
        const mockRows = [{ id: 1, name: 'John Doe' }];

        const result = await executeQuery(mockQuery, mockParams);
        expect(result).toEqual(mockRows);
    });

    it('should execute the given query with no params', async () => {
        const { executeQuery } = await import('../../utils/helperFunctions');

        const mockQuery = 'SELECT * FROM accounts';
        const mockRows = [{ id: 1, name: 'John Doe' }];

        const result = await executeQuery(mockQuery);
        expect(result).toEqual(mockRows);
    });

    it('should throw an error if the query fails', async () => {
        const { executeQuery } = await import('../../utils/helperFunctions');

        const mockQuery = 'SELECT * FROM nonExistingTable';
        const mockError = 'Error: Table does not exist';

        await executeQuery(mockQuery, []);
        await expect(executeQuery(mockQuery, [])).rejects.toThrow(mockError);
    });
});

describe('parseOrFallback function', () => {
    it('should return the parsed input', async () => {
        const { parseIntOrFallback } = await import(
            '../../utils/helperFunctions'
        );

        const mockInput = '1';
        const result = parseIntOrFallback(mockInput);
        expect(result).toEqual(1);
    });

    it('should return null if the input is null', async () => {
        const { parseIntOrFallback } = await import(
            '../../utils/helperFunctions'
        );

        const mockInput = null;
        const result = parseIntOrFallback(mockInput);
        expect(result).toBeNull();
    });

    it('should return null if the input is undefined', async () => {
        const { parseIntOrFallback } = await import(
            '../../utils/helperFunctions'
        );

        const mockInput = undefined;
        const result = parseIntOrFallback(mockInput);
        expect(result).toBeNull();
    });

    it('should return null if the input is not a number', async () => {
        const { parseIntOrFallback } = await import(
            '../../utils/helperFunctions'
        );

        const mockInput = 'not a number';
        const result = parseIntOrFallback(mockInput);
        expect(result).toBeNull();
    });
});

describe('manipulateCron function', () => {
    it('should return an array of success and response data for GET', async () => {
        const { manipulateCron } = await import('../../utils/helperFunctions');

        const mockData = null;
        const mockMethod = 'GET';
        const mockUniqueId = null;
        const mockResponseData = [true, { id: 1, name: 'John Doe' }];

        const result = await manipulateCron(mockData, mockMethod, mockUniqueId);
        expect(result).toEqual(mockResponseData);
    });

    it('should return an array of success and response data for POST', async () => {
        const { manipulateCron } = await import('../../utils/helperFunctions');

        const mockData = { id: 1, name: 'John Doe' };
        const mockMethod = 'POST';
        const mockUniqueId = null;
        const mockResponseData = [true, mockData];

        const result = await manipulateCron(mockData, mockMethod, mockUniqueId);
        expect(result).toEqual(mockResponseData);
    });

    it('should return an array of success and response data for PUT', async () => {
        const { manipulateCron } = await import('../../utils/helperFunctions');

        const mockData = { id: 1, name: 'John Doe' };
        const mockMethod = 'GET';
        const mockUniqueId = 'test-unique-id';
        const mockResponseData = [true, mockData];

        const result = await manipulateCron(mockData, mockMethod, mockUniqueId);
        expect(result).toEqual(mockResponseData);
    });
});
