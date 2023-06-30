import { jest } from '@jest/globals';

jest.unstable_mockModule('../../config/db.js', () => {
    return {
        default: {
            query: jest.fn()
                .mockResolvedValueOnce({ rows: [{ id: 1, name: 'John Doe' }] }) // Success case
                .mockRejectedValueOnce(new Error('Table does not exist')) // Failure case
        }
    };
});

const { handleError, executeQuery } = await import('../../utils/helperFunctions.js');

describe('handleError function', () => {
    it('should send a 400 error with the correct error message', async () => {
        const response = {
            status: jest.fn(() => response),
            send: jest.fn()
        };

        handleError(response, 'Test error message');

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.send).toHaveBeenCalledWith({
            errors: {
                msg: 'Test error message',
                param: null,
                location: 'query'
            }
        });
    });
});

describe('executeQuery function', () => {
    it('should execute the given query with the provided params', async () => {
        const mockQuery = 'SELECT * FROM accounts WHERE id = $1';
        const mockParams = [1];
        const mockRows = [{ id: 1, name: 'John Doe' }];

        const result = await executeQuery(mockQuery, mockParams);
        expect(result).toEqual(mockRows);
    });

    it('should throw an error if the query fails', async () => {
        const mockQuery = 'SELECT * FROM nonExistingTable';
        const mockError = 'Error: Table does not exist';

        await expect(executeQuery(mockQuery)).rejects.toThrow(mockError);
    });
});
