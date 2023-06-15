import { jest } from '@jest/globals';
import { accounts } from '../../models/mockData.js';

describe('GET /api/accounts', () => {
    afterEach(() => {
        jest.resetModules();
    });

    it('should respond with an array of accounts', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(accounts.filter(account => account.account_id === 1)),
            handleError: (res, message) => {
                res.status(400).send({ message });
            },
        }));

        const { getAccounts } = await import('../../controllers/accountsController.js');

        const mockRequest = {
            query: {
                id: 1
            }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        // Call the function with the mock request and response
        await getAccounts(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(accounts.filter(account => account.account_id === 1));
    });

    it('should handle errors correctly', async () => {
        // Arrange
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockRejectedValue(new Error('Error getting accounts')),
            handleError: (res, message) => {
                res.status(400).json({ message });
            },
        }));

        const { getAccounts } = await import('../../controllers/accountsController.js');

        const mockRequest = {
            query: {
                id: 1
            }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        // Act
        await getAccounts(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting accounts' });
    });
});

describe('POST /api/accounts', () => {
    afterEach(() => {
        jest.resetModules();
    });

    it('should respond with the new account', async () => {
        const newAccount = accounts.filter(account => account.account_id === 1);

        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(accounts.filter(account => account.account_id === 1)),
            handleError: (res, message) => {
                res.status(400).send({ message });
            },
        }));

        const { createAccount } = await import('../../controllers/accountsController.js');

        const mockRequest = {
            body: newAccount
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        await createAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newAccount);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockRejectedValue(new Error('Error creating account')),
            handleError: (res, message) => {
                res.status(400).json({ message });
            },
        }));

        const { createAccount } = await import('../../controllers/accountsController.js');

        const mockRequest = {
            body: accounts.filter(account => account.account_id === 1)
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        // Act
        await createAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating account' });
    });
});

describe('PUT /api/accounts/:id', () => {
    it('should respond with the updated account', async () => {
        const updatedAccount = accounts.filter(account => account.account_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedAccount };

        await updateAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedAccount);
    });
});

describe('DELETE /api/accounts/:id', () => {
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 } };

        await deleteAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted account');
    });
});
