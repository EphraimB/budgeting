import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { accounts } from '../../models/mockData';
import { type QueryResultRow } from 'pg';

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
    },
}));

// Mock request and response
let mockRequest: any;
let mockResponse: any;

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
});

afterEach(() => {
    jest.resetModules();
});

/**
 *
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    executeQueryValue: QueryResultRow[] | string | null,
    errorMessage?: string,
) => {
    const executeQuery =
        errorMessage !== null && errorMessage !== undefined
            ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
            : jest.fn(async () => await Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        // Arrange
        mockModule(accounts);

        const { getAccounts } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getAccounts(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(accounts);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting accounts';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getAccounts } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getAccounts(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting accounts',
        });
    });

    it('should respond with an array of accounts with an id', async () => {
        // Arrange
        mockModule(accounts.filter((account) => account.account_id === 1));

        const { getAccounts } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getAccounts(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            accounts.filter((account) => account.account_id === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting account';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getAccounts } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getAccounts(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting account',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getAccounts } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getAccounts(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account not found');
    });
});

describe('POST /api/accounts', () => {
    it('should respond with the new account', async () => {
        const newAccount = accounts.filter(
            (account) => account.account_id === 1,
        );

        mockModule(accounts.filter((account) => account.account_id === 1));

        const { createAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.body = newAccount;

        await createAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newAccount);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating account';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.body = accounts.filter(
            (account) => account.account_id === 1,
        );

        // Act
        await createAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating account',
        });
    });
});

describe('PUT /api/accounts/:id', () => {
    it('should respond with the updated account', async () => {
        const updatedAccount = accounts.filter(
            (account) => account.account_id === 1,
        );

        mockModule(accounts.filter((account) => account.account_id === 1));

        const { updateAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedAccount;

        await updateAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedAccount);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating account';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(
            (account) => account.account_id === 1,
        );

        // Act
        await updateAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating account',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(
            (account) => account.account_id === 1,
        );

        // Act
        await updateAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account not found');
    });
});

describe('DELETE /api/accounts/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted account');

        const { deleteAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted account',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting account';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting account',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteAccount } = await import(
            '../../controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account not found');
    });
});
