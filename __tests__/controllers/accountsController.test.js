import { jest } from '@jest/globals';
import { accounts } from '../../models/mockData.js';

// Mock request and response
let mockRequest;
let mockResponse;

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

describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(accounts.filter(account => account.account_id === 1)),
            handleError: (res, message) => {
                res.status(400).json({ message });
            },
        }));

        const { getAccounts } = await import('../../controllers/accountsController.js');

        mockRequest.query = { id: 1 };

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

        mockRequest.query = { id: 1 };

        // Act
        await getAccounts(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting accounts' });
    });
});

describe('POST /api/accounts', () => {
    it('should respond with the new account', async () => {
        const newAccount = accounts.filter(account => account.account_id === 1);

        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(accounts.filter(account => account.account_id === 1)),
            handleError: (res, message) => {
                res.status(400).send({ message });
            },
        }));

        const { createAccount } = await import('../../controllers/accountsController.js');

        mockRequest.body = newAccount;

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

        mockRequest.body = accounts.filter(account => account.account_id === 1);

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

        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(accounts.filter(account => account.account_id === 1)),
            handleError: (res, message) => {
                res.status(400).send({ message });
            },
        }));

        const { updateAccount } = await import('../../controllers/accountsController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updateAccount;

        await updateAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedAccount);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockRejectedValue(new Error('Error updating account')),
            handleError: (res, message) => {
                res.status(400).json({ message });
            },
        }));

        const { updateAccount } = await import('../../controllers/accountsController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(account => account.account_id === 1);

        // Act
        await updateAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating account' });
    });
});

describe('DELETE /api/accounts/:id', () => {
    it('should respond with a success message', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(accounts.filter(account => account.account_id === 1)),
            handleError: (res, message) => {
                res.status(400).send({ message });
            },
        }));

        const { deleteAccount } = await import('../../controllers/accountsController.js');

        mockRequest.params = { id: 1 };

        await deleteAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted account');
    });

    it('should handle errors correctly', async () => {
        // Arrange
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockRejectedValue(new Error('Error deleting account')),
            handleError: (res, message) => {
                res.status(400).json({ message });
            },
        }));

        const { deleteAccount } = await import('../../controllers/accountsController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting account' });
    });
});
