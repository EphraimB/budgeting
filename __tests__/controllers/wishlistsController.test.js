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
        mockModule(wishlists.filter(wishlist => wishlist.wishlist_id === 1));

        mockRequest.query = { id: 1 };

        const { getWishlists } = await import('../../controllers/wishlistsController.js');

        // Call the function with the mock request and response
        await getWishlists(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlists.filter(wishlist => wishlist.wishlist_id === 1));
    });

    it('should respond with an error message', async () => {
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
        const newWishlist = wishlists.filter(wishlist => wishlist.wishlist_id === 1);
        mockRequest = { body: newWishlist };

        await createWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newWishlist);
    });
});

describe('PUT /api/wishlists/:id', () => {
    it('should respond with the updated wishlist', async () => {
        const updatedWishlist = wishlists.filter(wishlist => wishlist.wishlist_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedWishlist };

        await updateWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedWishlist);
    });
});

describe('DELETE /api/wishlists/:id', () => {
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 } };

        await deleteWishlist(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted wishlist item');
    });
});
