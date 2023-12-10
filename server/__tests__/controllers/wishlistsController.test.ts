import { type Request } from 'express';
import { type Wishlist } from '../../types/types.js';
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
let mockNext: any;

jest.mock('../../config/winston', () => ({
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
    mockNext = jest.fn();
});

afterEach(() => {
    jest.resetModules();
});

const wishlists = [
    {
        wishlist_id: 1,
        cron_job_id: 1,
        tax_id: 1,
        account_id: 1,
        wishlist_amount: 1000,
        wishlist_title: 'Test Wishlist',
        wishlist_description: 'Test Wishlist to test the wishlist route',
        wishlist_date_available: null,
        wishlist_url_link: 'https://www.google.com/',
        wishlist_priority: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const wishlistsResponse: Wishlist[] = [
    {
        id: 1,
        tax_id: 1,
        account_id: 1,
        wishlist_amount: 1000,
        wishlist_title: 'Test Wishlist',
        wishlist_description: 'Test Wishlist to test the wishlist route',
        wishlist_date_available: null,
        wishlist_date_can_purchase: null,
        wishlist_url_link: 'https://www.google.com/',
        wishlist_priority: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

describe('GET /api/wishlists', () => {
    it('should respond with an array of wishlists', async () => {
        // Arrange
        mockModule([wishlists]);

        mockRequest.query = { account_id: null, id: null };

        mockRequest.transactions = [
            {
                transactions: wishlists.map((wishlist, i) => ({
                    wishlist_id: wishlist.wishlist_id,
                    date: `2023-08-14T00:0${i}:00.000Z`,
                })),
            },
        ];

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        wishlistsResponse[0].wishlist_date_can_purchase =
            '2023-08-14T00:00:00.000Z';

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlistsResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlists';
        mockModule([], [errorMessage]);

        mockRequest.query = { account_id: null, id: null };

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting wishlists',
        });
    });

    it('should respond with an array of wishlists with id', async () => {
        const id = 1;
        // Arrange
        mockModule([
            wishlists.filter((wishlist) => wishlist.wishlist_id === id),
        ]);

        mockRequest.query = { account_id: null, id };

        mockRequest.transactions = [
            {
                transactions: wishlists
                    .filter((wishlist) => wishlist.wishlist_id === id)
                    .map((wishlist, i) => ({
                        wishlist_id: wishlist.wishlist_id,
                        date: `2023-08-14T00:0${i}:00.000Z`,
                    })),
            },
        ];

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlistsResponse);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        mockModule([], [errorMessage]);

        mockRequest.query = { account_id: null, id: 1 };

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting wishlist',
        });
    });

    it('should respond with an array of wishlists with account id', async () => {
        // Arrange
        mockModule([wishlists.filter((wishlist) => wishlist.account_id === 1)]);

        mockRequest.query = { account_id: 1, id: null };

        mockRequest.transactions = [
            {
                transactions: wishlists
                    .filter((wishlist) => wishlist.account_id === 1)
                    .map((wishlist, i) => ({
                        wishlist_id: wishlist.wishlist_id,
                        date: `2023-08-14T00:0${i}:00.000Z`,
                    })),
            },
        ];

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlistsResponse);
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        mockModule([], [errorMessage]);

        mockRequest.query = { account_id: 1 };

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting wishlists for given account_id',
        });
    });

    it('should respond with an array of wishlists with account id and wishlist id', async () => {
        // Arrange
        mockModule([
            wishlists.filter(
                (wishlist) =>
                    wishlist.account_id === 1 && wishlist.wishlist_id === 1,
            ),
        ]);

        mockRequest.query = { account_id: 1, id: 1 };

        mockRequest.transactions = [
            {
                transactions: wishlists
                    .filter(
                        (wishlist) =>
                            wishlist.account_id === 1 &&
                            wishlist.wishlist_id === 1,
                    )
                    .map((wishlist, i) => ({
                        wishlist_id: wishlist.wishlist_id,
                        date: `2023-08-14T00:0${i}:00.000Z`,
                    })),
            },
        ];

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        expect(mockResponse.json).toHaveBeenCalledWith(wishlistsResponse);
    });

    it('should respond with an error message with account id and wishlist id', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        mockModule([], [errorMessage]);

        mockRequest.query = { account_id: 1, id: 1 };

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting wishlist',
        });
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getWishlists(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });

    it('should respond with an array of wishlists when wishlist_date_can_purchase is null', async () => {
        // Arrange
        mockModule([wishlists]);

        mockRequest.query = { account_id: null, id: null };

        mockRequest.transactions = [
            {
                transactions: [],
            },
        ];

        const { getWishlists } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await getWishlists(mockRequest as Request, mockResponse);

        wishlistsResponse[0].wishlist_date_can_purchase = null;

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlistsResponse);
    });
});

describe('POST /api/wishlists middleware', () => {
    it('should populate the request.wishlist_id', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule([newWishlist]);

        const { createWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.body = newWishlist;

        // Act
        await createWishlist(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.wishlist_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating wishlist';
        mockModule([], [errorMessage]);

        const { createWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.body = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        // Call the function with the mock request and response
        await createWishlist(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating wishlist',
        });
    });
});

describe('POST /api/wishlists', () => {
    it('should respond with the new wishlist', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule([
            newWishlist,
            [{ cron_job_id: 1 }],
            [{ wishlist_id: 1, cron_job_id: 1 }],
            [
                {
                    wishlist_id: 1,
                    wishlist_title: 'Test Wishlist',
                    cron_job_id: 1,
                },
            ],
        ]);

        const { createWishlistCron } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.wishlist_id = 1;
        mockRequest.body = newWishlist;
        mockRequest.transactions = [
            {
                account_id: 1,
                transactions: [
                    {
                        expense_id: 1,
                        date: null,
                        amount: 100,
                        title: 'Test',
                        description: 'Test',
                    },
                ],
            },
        ];

        await createWishlistCron(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(wishlistsResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating wishlist';
        mockModule([], [errorMessage]);

        const { createWishlistCron } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.wishlist_id = 1;
        mockRequest.transactions = [
            {
                account_id: 1,
                transactions: [
                    {
                        expense_id: 1,
                        date: null,
                        amount: 100,
                        title: 'Test',
                        description: 'Test',
                    },
                ],
            },
        ];

        // Call the function with the mock request and response
        await createWishlistCron(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating cron tab',
        });
    });
});

describe('PUT /api/wishlists middleware', () => {
    it('should populate the request.wishlist_id', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule([newWishlist]);

        const { updateWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = newWishlist;

        // Act
        await updateWishlist(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.wishlist_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule([[]]);

        const { updateWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = newWishlist;

        // Act
        await updateWishlist(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating wishlist';
        mockModule([], [errorMessage]);

        const { updateWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        // Call the function with the mock request and response
        await updateWishlist(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating wishlist',
        });
    });
});

describe('PUT /api/wishlists/:id', () => {
    it('should respond with the updated wishlist', async () => {
        // Arrange
        const updatedWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule([
            updatedWishlist,
            [{ cron_job_id: 1 }],
            [{ wishlist_id: 1, cron_job_id: 1 }],
            updatedWishlist,
        ]);

        mockRequest.wishlist_id = 1;
        mockRequest.body = updatedWishlist;
        mockRequest.transactions = [
            {
                account_id: 1,
                transactions: [
                    {
                        expense_id: 1,
                        date: '2023-08-14T00:00:00.000Z',
                        amount: 100,
                        title: 'Test',
                        description: 'Test',
                    },
                ],
            },
        ];

        const { updateWishlistCron } = await import(
            '../../controllers/wishlistsController.js'
        );

        await updateWishlistCron(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            wishlistsResponse.filter((wishlist) => wishlist.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        mockModule([], [errorMessage]);

        const { updateWishlistCron } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Call the function with the mock request and response
        await updateWishlistCron(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating cron tab',
        });
    });
});

describe('DELETE /api/wishlists/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([
            [{ wishlist_id: 1, cron_job_id: 1 }], // createWishlist result
            [{ uniqueId: 'ws8fgv89w', cronDate: '* * * * *' }], // getCronJob result
        ]);

        mockRequest.params = { id: 1 };

        const { deleteWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted wishlist item',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        mockModule([], [errorMessage]);

        const { deleteWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting wishlist',
        });
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteWishlist } = await import(
            '../../controllers/wishlistsController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deleteWishlist(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Wishlist not found');
    });
});
