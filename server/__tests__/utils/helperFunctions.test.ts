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
    it('should send a 400 error with the correct error message', async () => {
        const { handleError } = await import('../../utils/helperFunctions');

        handleError(mockResponse, 'Test error message');

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({
            errors: {
                msg: 'Test error message',
                param: null,
                location: 'query',
            },
        });
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
