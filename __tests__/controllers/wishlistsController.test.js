import { jest } from '@jest/globals';
import { wishlists } from '../../models/mockData.js';

jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue(wishlists.filter(wishlist => wishlist.wishlist_id === 1)),
    handleError: jest.fn().mockReturnValue({ message: 'Error' }),
}));

const { getWishlists, createWishlist, updateWishlist, deleteWishlist } = await import('../../controllers/wishlistsController.js');

let mockRequest = {};
let mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),  // Mock send method
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/wishlists', () => {
    it('should respond with an array of wishlists', async () => {
        mockRequest = {
            query: {
                id: 1
            }
        }; // Set the mockRequest.query

        // Call the function with the mock request and response
        await getWishlists(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlists.filter(wishlist => wishlist.wishlist_id === 1));
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
