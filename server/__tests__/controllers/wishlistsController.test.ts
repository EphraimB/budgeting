import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { transactions, wishlists } from '../../models/mockData.js';
import { QueryResultRow } from 'pg';
import { Wishlist } from '../../types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let consoleSpy: any;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
    };
});

afterEach(() => {
    jest.resetModules();
});

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

/**
 * 
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (createWishlist: QueryResultRow[] | string | null, errorMessage?: string, createCronJob?: QueryResultRow[] | string | null, updateWishlistWithCronJobId?: QueryResultRow[] | string | null) => {
    let index = 0;
    const executeQuery = errorMessage
        ? jest.fn(() => Promise.reject(new Error(errorMessage)))
        : jest.fn(() => {
            switch (index++) {
                case 0: return Promise.resolve(createWishlist);
                case 1: return Promise.resolve(createCronJob);
                case 2: return Promise.resolve(updateWishlistWithCronJobId);
                default: return Promise.resolve(null);
            }
        });

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/wishlists', () => {
    it('should respond with an array of wishlists', async () => {
        // Arrange
        mockModule(wishlists);

        mockRequest.query = { account_id: null, id: null };

        mockRequest.transactions = [
            {
                transactions: wishlists.map((wishlist, i) => ({ wishlist_id: wishlist.wishlist_id, date: `2023-08-14T00:0${i}:00.000Z` }))
            }
        ];

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        const modifiedWishlists = wishlists.map((wishlist, i) => ({
            ...wishlist,
            wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`
        }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedWishlists);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlists';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: null, id: null };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlists' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of wishlists with id', async () => {
        const id = 1;
        // Arrange
        mockModule(wishlists.filter(wishlist => wishlist.wishlist_id === 1));

        mockRequest.query = { account_id: null, id };

        mockRequest.transactions = [
            {
                transactions: wishlists
                    .filter(wishlist => wishlist.wishlist_id === id)
                    .map((wishlist, i) => ({ wishlist_id: wishlist.wishlist_id, date: `2023-08-14T00:0${i}:00.000Z` }))
            }
        ];

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        const modifiedWishlists = wishlists
            .filter(wishlist => wishlist.wishlist_id === id)
            .map((wishlist, i) => ({
                ...wishlist,
                wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`
            }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedWishlists);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: null, id: 1 };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlist' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of wishlists with account id', async () => {
        // Arrange
        mockModule(wishlists.filter(wishlist => wishlist.account_id === 1));

        mockRequest.query = { account_id: 1, id: null };

        mockRequest.transactions = [
            {
                transactions: wishlists
                    .filter(wishlist => wishlist.account_id === 1)
                    .map((wishlist, i) => ({ wishlist_id: wishlist.wishlist_id, date: `2023-08-14T00:0${i}:00.000Z` }))
            }
        ];

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        const modifiedWishlists = wishlists
            .filter(wishlist => wishlist.account_id === 1)
            .map((wishlist, i) => ({
                ...wishlist,
                wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`
            }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedWishlists);
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: 1 };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlists for given account_id' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of wishlists with account id and wishlist id', async () => {
        // Arrange
        mockModule(wishlists.filter(wishlist => wishlist.account_id === 1 && wishlist.wishlist_id === 1));

        mockRequest.query = { account_id: 1, id: 1 };

        mockRequest.transactions = [
            {
                transactions: wishlists
                    .filter(wishlist => wishlist.account_id === 1 && wishlist.wishlist_id === 1)
                    .map((wishlist, i) => ({ wishlist_id: wishlist.wishlist_id, date: `2023-08-14T00:0${i}:00.000Z` }))
            }
        ];

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        const modifiedWishlists = wishlists
            .filter(wishlist => wishlist.account_id === 1 && wishlist.wishlist_id === 1)
            .map((wishlist, i) => ({
                ...wishlist,
                wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`
            }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        expect(mockResponse.json).toHaveBeenCalledWith(modifiedWishlists);
    });

    it('should respond with an error message with account id and wishlist id', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: 1, id: 1 };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlist' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });
});

describe('POST /api/wishlists', () => {
    it('should respond with the new wishlist', async () => {
        // Arrange
        const newWishlist = wishlists.filter(wishlist => wishlist.wishlist_id === 1);

        mockModule(newWishlist, undefined, [{ cron_job_id: 1 }], [{ wishlist_id: 1, cron_job_id: 1 }]);

        jest.mock('../../crontab/scheduleCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(() => Promise.resolve({ cronDate: '* * * * *', uniqueId: '1fw34' }))
        }));

        const { updateCronTab } = await import('../../controllers/wishlistsController.js');

        // Add wishlist_date_can_purchase to the wishlist object
        const modifiedWishlist: Wishlist = {
            ...newWishlist[0],
            wishlist_date_can_purchase: null
        };

        mockRequest.wishlist_id = 1;
        mockRequest.body = newWishlist;
        mockRequest.transactions = [{
            account_id: 1,
            transactions: [{
                expense_id: 1,
                date: null,
                amount: 100,
                title: 'Test',
                description: 'Test'
            }]
        }];

        await updateCronTab(mockRequest as Request, mockResponse);

        // Assert
        // expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith([modifiedWishlist]);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateCronTab } = await import('../../controllers/wishlistsController.js');

        jest.mock('../../crontab/scheduleCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(() => Promise.resolve({ cronDate: '* * * * *', uniqueId: '1fw34' }))
        }));

        mockRequest.wishlist_id = 1;
        mockRequest.transactions = [{
            account_id: 1,
            transactions: [{
                expense_id: 1,
                date: null,
                amount: 100,
                title: 'Test',
                description: 'Test'
            }]
        }];

        // Call the function with the mock request and response
        await updateCronTab(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating cron tab' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/wishlists/:id', () => {
    it('should respond with the updated wishlist', async () => {
        // Arrange
        const updatedWishlist = wishlists.filter(wishlist => wishlist.wishlist_id === 1);

        mockModule(updatedWishlist);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedWishlist;

        const { updateWishlist } = await import('../../controllers/wishlistsController.js');

        await updateWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedWishlist);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateWishlist } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await updateWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating wishlist' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateWishlist } = await import('../../controllers/wishlistsController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = wishlists.filter(wishlist => wishlist.wishlist_id === 1);

        // Act
        await updateWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });
});

describe('DELETE /api/wishlists/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted wishlist item');

        mockRequest.params = { id: 1 };

        const { deleteWishlist } = await import('../../controllers/wishlistsController.js');

        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted wishlist item');
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteWishlist } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting wishlist' });

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteWishlist } = await import('../../controllers/wishlistsController.js');

        mockRequest.params = { id: 3 };

        // Act
        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });
});
