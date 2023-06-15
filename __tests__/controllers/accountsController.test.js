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

// Helper function to generate mock module
const mockModule = (executeQueryValue, errorMessage) => {
    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: errorMessage
            ? jest.fn().mockRejectedValue(new Error(errorMessage))
            : jest.fn().mockResolvedValue(executeQueryValue),
        handleError: jest.fn((res, message) => {
            res.status(400).json({ message });
        }),
    }));
};


describe('GET /api/accounts', () => {
    it('should respond with an array of accounts', async () => {
        // Arrange
        mockModule(accounts.filter(account => account.account_id === 1));

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
        mockModule(null, 'Error getting accounts');

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

        mockModule(accounts.filter(account => account.account_id === 1));

        const { createAccount } = await import('../../controllers/accountsController.js');

        mockRequest.body = newAccount;

        await createAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newAccount);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule(null, 'Error creating account');

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

        mockModule(accounts.filter(account => account.account_id === 1));

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
        mockModule(null, 'Error updating account');

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
        // Arrange
        mockModule(accounts.filter(account => account.account_id === 1));

        const { deleteAccount } = await import('../../controllers/accountsController.js');

        mockRequest.params = { id: 1 };

        await deleteAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted account');
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule(null, 'Error deleting account');

        const { deleteAccount } = await import('../../controllers/accountsController.js');

        mockRequest.params = { id: 1 };

        // Act
        await deleteAccount(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting account' });
    });
});
