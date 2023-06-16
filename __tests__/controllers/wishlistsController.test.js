import { jest } from '@jest/globals';
import { wishlists } from '../../models/mockData.js';

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

describe('GET /api/wishlists', () => {
    it('should respond with an array of wishlists', async () => {
        // Arrange
        mockModule(wishlists);

        mockRequest.query = { id: null };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlists);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error getting wishlists');

        mockRequest.query = { id: null };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlists' });
    });

    it('should respond with an array of wishlists with id', async () => {
        // Arrange
        mockModule(wishlists.filter(wishlist => wishlist.wishlist_id === 1));

        mockRequest.query = { id: 1 };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlists.filter(wishlist => wishlist.wishlist_id === 1));
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule(null, 'Error getting wishlists');

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlists' });
    });
});

describe('POST /api/wishlists', () => {
    it('should respond with the new wishlist', async () => {
        // Arrange
        const newWishlist = wishlists.filter(wishlist => wishlist.wishlist_id === 1);

        mockModule(newWishlist);

        const { createWishlist } = await import('../../controllers/wishlistsController.js');

        mockRequest.body = newWishlist;

        await createWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newWishlist);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error creating wishlist');

        const { createWishlist } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await createWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating wishlist' });
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

        await updateWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedWishlist);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error updating wishlist');

        const { updateWishlist } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await updateWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating wishlist' });
    });
});

describe('DELETE /api/wishlists/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted wishlist item');

        mockRequest.params = { id: 1 };

        const { deleteWishlist } = await import('../../controllers/wishlistsController.js');

        await deleteWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted wishlist item');
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error deleting wishlist');

        const { deleteWishlist } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await deleteWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting wishlist' });
    });
});
