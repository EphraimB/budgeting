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

// Mock request and response
let mockRequest: any;
let mockResponse: any;

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const wishlists = [
    {
        wishlists: [
            {
                id: 1,
                cronJobId: 1,
                taxId: 1,
                accountId: 1,
                amount: 1000,
                title: 'Test Wishlist',
                description: 'Test Wishlist to test the wishlist route',
                dateAvailable: null,
                urlLink: 'https://www.google.com/',
                priority: 0,
                dateCanPurchase: '2023-08-14',
                dateCreated: '2020-01-01',
                dateModified: '2020-01-01',
            },
        ],
    },
];
describe('GET /api/wishlists', () => {
    it('should respond with an array of wishlists', async () => {
        // Arrange
        mockModule([wishlists[0].wishlists], wishlists);

        const { getWishlists } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlists);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { getWishlists } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting wishlists',
            });
        });
    });

    it('should respond with an array of wishlists with account id', async () => {
        // Arrange
        mockModule(
            [
                wishlists[0].wishlists.filter(
                    (wishlist) => wishlist.accountId === 1,
                ),
            ],
            wishlists[0].wishlists.filter(
                (wishlist) => wishlist.accountId === 1,
            ),
        );

        const { getWishlists } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            wishlists[0].wishlists.filter(
                (wishlist) => wishlist.accountId === 1,
            ),
        );
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        mockModule([]);

        const { getWishlists } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting wishlists for given account id',
            });
        });
    });
});

describe('GET /api/wishlists/:id', () => {
    it('should respond with an array of wishlists with id', async () => {
        // Arrange
        mockModule(
            [wishlists],
            wishlists[0].wishlists.filter((wishlist) => wishlist.id === 1),
        );

        const { getWishlistsById } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getWishlistsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            wishlists[0].wishlists.filter((wishlist) => wishlist.id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        const { getWishlistsById } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getWishlistsById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting wishlist',
                });
            },
        );
    });

    it('should respond with an array of wishlists with account id and id', async () => {
        // Arrange
        mockModule(
            [wishlists],
            wishlists[0].wishlists.filter(
                (wishlist) => wishlist.accountId === 1 && wishlist.id === 1,
            ),
        );

        const { getWishlistsById } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getWishlistsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            wishlists[0].wishlists.filter(
                (wishlist) => wishlist.accountId === 1 && wishlist.id === 1,
            ),
        );
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        mockModule([]);

        const { getWishlistsById } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getWishlistsById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting wishlist',
                });
            },
        );
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getWishlistsById } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: null };

        // Act
        await getWishlistsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });
});

describe('POST /api/wishlists', () => {
    it('should respond with the created wishlist', async () => {
        // Arrange
        const newWishlist = wishlists[0].wishlists.filter(
            (wishlist) => wishlist.id === 1,
        );

        mockModule(
            [
                [],
                newWishlist,
                [{ tax_rate: 0 }],
                [{ id: 1, date_can_purchase: '2023-08-14' }],
                [],
                [{ id: 1, unique_id: 'vfpvqpqcqpi' }],
                [],
                [],
            ],
            newWishlist,
        );

        const { createWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.body = newWishlist;

        // Act
        await createWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newWishlist);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { createWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.body = wishlists[0].wishlists.filter(
            (wishlist) => wishlist.id === 1,
        );

        // Call the function with the mock request and response
        await createWishlist(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating wishlist',
            });
        });
    });
});

describe('PUT /api/wishlists/:id', () => {
    it('should respond with the updated wishlist', async () => {
        // Arrange
        const newWishlist = wishlists[0].wishlists.filter(
            (wishlist) => wishlist.id === 1,
        );

        mockModule(
            [
                [],
                newWishlist,
                [{ tax_rate: 0 }],
                [{ id: 1, date_can_purchase: '2023-08-14' }],
                [{ unique_id: 'vbfp39qb9' }],
                [],
                [],
                [],
                [],
                [],
            ],
            newWishlist,
        );

        const { updateWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = newWishlist;

        // Act
        await updateWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(newWishlist);
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        const newWishlist = wishlists[0].wishlists.filter(
            (wishlist) => wishlist.id === 1,
        );

        mockModule([[], []]);

        const { updateWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = newWishlist;

        // Act
        await updateWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { updateWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = wishlists[0].wishlists.filter(
            (wishlist) => wishlist.id === 1,
        );

        // Call the function with the mock request and response
        await updateWishlist(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating wishlist',
            });
        });
    });
});

describe('DELETE /api/wishlists/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([
            [{ id: 1, cron_job_id: 1 }],
            [{ id: 1, unique_id: 'b3780xb48' }],
            [],
            [],
            [],
            [],
            [],
        ]);

        const { deleteWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted wishlist item',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { deleteWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await deleteWishlist(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting wishlist',
            });
        });
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteWishlist } = await import(
            '../../src/controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });
});
