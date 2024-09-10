import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';

jest.mock('../../src/config/winston', () => ({
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

const accounts = [
    {
        accountId: 1,
        name: 'Test Account',
        balance: 1000,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        accountId: 2,
        name: 'Test Account 2',
        balance: 2000,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        // Arrange
        mockModule([accounts]);

        const { getAccounts } = await import(
            '../../src/controllers/accountsController.js'
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
        mockModule([]);

        const { getAccounts } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getAccounts(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting accounts',
            });
        });
    });

    it('should respond with an array of accounts with an id', async () => {
        // Arrange
        mockModule([accounts.filter((account) => account.accountId === 1)]);

        const { getAccountsById } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getAccountsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            accounts.filter((account) => account.accountId === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        mockModule([]);

        const { getAccountsById } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await getAccountsById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting account',
                });
            },
        );
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getAccountsById } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await getAccountsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account not found');
    });
});

describe('POST /api/accounts', () => {
    it('should respond with the new account', async () => {
        const newAccount = accounts.filter(
            (account) => account.accountId === 1,
        );

        mockModule([newAccount]);

        const { createAccount } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.body = newAccount;

        await createAccount(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newAccount);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createAccount } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.body = accounts.filter(
            (account) => account.accountId === 1,
        );

        // Act
        await createAccount(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating account',
            });
        });
    });
});

describe('PUT /api/accounts/:id', () => {
    it('should respond with the updated account', async () => {
        const updatedAccount = accounts.filter(
            (account) => account.accountId === 1,
        );

        mockModule([updatedAccount, updatedAccount]);

        const { updateAccount } = await import(
            '../../src/controllers/accountsController.js'
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
        mockModule([]);

        const { updateAccount } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(
            (account) => account.accountId === 1,
        );

        // Act
        await updateAccount(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating account',
            });
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateAccount } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(
            (account) => account.accountId === 1,
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
        mockModule(['Successfully deleted account']);

        const { deleteAccount } = await import(
            '../../src/controllers/accountsController.js'
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
        mockModule([]);

        const { deleteAccount } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteAccount(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting account',
            });
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteAccount } = await import(
            '../../src/controllers/accountsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteAccount(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith('Account not found');
        });
    });
});
