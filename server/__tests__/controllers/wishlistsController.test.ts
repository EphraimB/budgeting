import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { wishlists } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';
import { type Wishlist } from '../../types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
const mockNext: any = jest.fn();
let consoleSpy: any;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

/**
 *
 * @param createWishlist - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @param [createCronJobValue] - The value to be returned by the createCronJob mock function
 * @param [updateWishlistWithCronJobIdValue] - The value to be returned by the updateWishlistWithCronJobId mock function
 * @param [getWishlistsByIdValue] - The value to be returned by the getWishlistsById mock function
 * @param [getCronJobValue] - The value to be returned by the getCronJob mock function
 * @param [deleteWishlistValue] - The value to be returned by the deleteWishlist mock function
 * @param [deleteCronJobValue] - The value to be returned by the deleteCronJob mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    createWishlist: QueryResultRow[] | string | null,
    errorMessage?: string,
    createCronJob?: QueryResultRow[] | string | null,
    updateWishlistWithCronJobId?: QueryResultRow[] | string | null,
    getWishlistsById?: QueryResultRow[] | string | null,
    getCronJob?: QueryResultRow[] | string | null,
    deleteWishlist?: QueryResultRow[] | string | null,
    deleteCronJob?: QueryResultRow | string | null,
) => {
    let index = 0;
    const executeQuery = errorMessage
        ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
        : jest.fn(async () => {
              let result;

              switch (index++) {
                  case 0:
                      result = Promise.resolve(createWishlist);
                      break;
                  case 1:
                      result = Promise.resolve(createCronJob);
                      break;
                  case 2:
                      result = Promise.resolve(updateWishlistWithCronJobId);
                      break;
                  case 3:
                      result = Promise.resolve(getWishlistsById);
                      break;
                  case 4:
                      result = Promise.resolve(getCronJob);
                      break;
                  case 5:
                      result = Promise.resolve(deleteWishlist);
                      break;
                  case 6:
                      result = Promise.resolve(deleteCronJob);
                      break;
                  default:
                      result = Promise.resolve(null);
                      break;
              }
              return await result;
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

        const modifiedWishlists = wishlists.map((wishlist, i) => ({
            account_id: wishlist.account_id,
            tax_id: wishlist.tax_id,
            date_created: wishlist.date_created,
            date_modified: wishlist.date_modified,
            wishlist_amount: wishlist.wishlist_amount,
            wishlist_date_available: wishlist.wishlist_date_available,
            wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`,
            wishlist_description: wishlist.wishlist_description,
            wishlist_id: wishlist.wishlist_id,
            wishlist_priority: wishlist.wishlist_priority,
            wishlist_title: wishlist.wishlist_title,
            wishlist_url_link: wishlist.wishlist_url_link,
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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of wishlists with id', async () => {
        const id = 1;
        // Arrange
        mockModule(wishlists.filter((wishlist) => wishlist.wishlist_id === 1));

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

        const modifiedWishlists = wishlists
            .filter((wishlist) => wishlist.wishlist_id === id)
            .map((wishlist, i) => ({
                account_id: wishlist.account_id,
                tax_id: wishlist.tax_id,
                date_created: wishlist.date_created,
                date_modified: wishlist.date_modified,
                wishlist_amount: wishlist.wishlist_amount,
                wishlist_date_available: wishlist.wishlist_date_available,
                wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`,
                wishlist_description: wishlist.wishlist_description,
                wishlist_id: wishlist.wishlist_id,
                wishlist_priority: wishlist.wishlist_priority,
                wishlist_title: wishlist.wishlist_title,
                wishlist_url_link: wishlist.wishlist_url_link,
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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of wishlists with account id', async () => {
        // Arrange
        mockModule(wishlists.filter((wishlist) => wishlist.account_id === 1));

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

        const modifiedWishlists = wishlists
            .filter((wishlist) => wishlist.account_id === 1)
            .map((wishlist, i) => ({
                account_id: wishlist.account_id,
                tax_id: wishlist.tax_id,
                date_created: wishlist.date_created,
                date_modified: wishlist.date_modified,
                wishlist_amount: wishlist.wishlist_amount,
                wishlist_date_available: wishlist.wishlist_date_available,
                wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`,
                wishlist_description: wishlist.wishlist_description,
                wishlist_id: wishlist.wishlist_id,
                wishlist_priority: wishlist.wishlist_priority,
                wishlist_title: wishlist.wishlist_title,
                wishlist_url_link: wishlist.wishlist_url_link,
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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of wishlists with account id and wishlist id', async () => {
        // Arrange
        mockModule(
            wishlists.filter(
                (wishlist) =>
                    wishlist.account_id === 1 && wishlist.wishlist_id === 1,
            ),
        );

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

        const modifiedWishlists = wishlists
            .filter(
                (wishlist) =>
                    wishlist.account_id === 1 && wishlist.wishlist_id === 1,
            )
            .map((wishlist, i) => ({
                account_id: wishlist.account_id,
                tax_id: wishlist.tax_id,
                date_created: wishlist.date_created,
                date_modified: wishlist.date_modified,
                wishlist_amount: wishlist.wishlist_amount,
                wishlist_date_available: wishlist.wishlist_date_available,
                wishlist_date_can_purchase: `2023-08-14T00:0${i}:00.000Z`,
                wishlist_description: wishlist.wishlist_description,
                wishlist_id: wishlist.wishlist_id,
                wishlist_priority: wishlist.wishlist_priority,
                wishlist_title: wishlist.wishlist_title,
                wishlist_url_link: wishlist.wishlist_url_link,
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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([]);

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
        mockModule(wishlists);

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

        const modifiedWishlists = wishlists.map((wishlist, i) => ({
            account_id: wishlist.account_id,
            tax_id: wishlist.tax_id,
            date_created: wishlist.date_created,
            date_modified: wishlist.date_modified,
            wishlist_amount: wishlist.wishlist_amount,
            wishlist_date_available: wishlist.wishlist_date_available,
            wishlist_date_can_purchase: null,
            wishlist_description: wishlist.wishlist_description,
            wishlist_id: wishlist.wishlist_id,
            wishlist_priority: wishlist.wishlist_priority,
            wishlist_title: wishlist.wishlist_title,
            wishlist_url_link: wishlist.wishlist_url_link,
        }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedWishlists);
    });
});

describe('POST /api/wishlists middleware', () => {
    it('should populate the request.wishlist_id', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule(newWishlist);

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
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('POST /api/wishlists', () => {
    it('should respond with the new wishlist', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule(
            newWishlist,
            undefined,
            [{ cron_job_id: 1 }],
            [{ wishlist_id: 1, cron_job_id: 1 }],
            [
                {
                    wishlist_id: 1,
                    wishlist_title: 'Test Wishlist',
                    cron_job_id: 1,
                },
            ],
        );

        jest.mock('../../crontab/scheduleCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(
                async () =>
                    await Promise.resolve({
                        cronDate: '* * * * *',
                        uniqueId: '1fw34',
                    }),
            ),
        }));

        const { createWishlistCron } = await import(
            '../../controllers/wishlistsController.js'
        );

        // Add wishlist_date_can_purchase to the wishlist object
        const modifiedWishlist: Wishlist = {
            account_id: newWishlist[0].account_id,
            tax_id: newWishlist[0].tax_id,
            date_created: newWishlist[0].date_created,
            date_modified: newWishlist[0].date_modified,
            wishlist_amount: newWishlist[0].wishlist_amount,
            wishlist_date_available: newWishlist[0].wishlist_date_available,
            wishlist_date_can_purchase: null,
            wishlist_description: newWishlist[0].wishlist_description,
            wishlist_id: newWishlist[0].wishlist_id,
            wishlist_priority: newWishlist[0].wishlist_priority,
            wishlist_title: newWishlist[0].wishlist_title,
            wishlist_url_link: newWishlist[0].wishlist_url_link,
        };

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
        expect(mockResponse.json).toHaveBeenCalledWith([modifiedWishlist]);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createWishlistCron } = await import(
            '../../controllers/wishlistsController.js'
        );

        jest.mock('../../crontab/scheduleCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(
                async () =>
                    await Promise.resolve({
                        cronDate: '* * * * *',
                        uniqueId: '1fw34',
                    }),
            ),
        }));

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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/wishlists middleware', () => {
    it('should populate the request.wishlist_id', async () => {
        // Arrange
        const newWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule(newWishlist);

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

        mockModule([]);

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
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/wishlists/:id', () => {
    it('should respond with the updated wishlist', async () => {
        // Arrange
        const updatedWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule(
            updatedWishlist,
            undefined,
            [{ cron_job_id: 1 }],
            [{ wishlist_id: 1, cron_job_id: 1 }],
            updatedWishlist,
        );

        jest.mock('../../crontab/deleteCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(),
        }));

        jest.mock('../../crontab/scheduleCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(
                async () =>
                    await Promise.resolve({
                        cronDate: '* * * * *',
                        uniqueId: '1fw34',
                    }),
            ),
        }));

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

        const modifiedWishlist: Wishlist = {
            account_id: updatedWishlist[0].account_id,
            tax_id: updatedWishlist[0].tax_id,
            date_created: updatedWishlist[0].date_created,
            date_modified: updatedWishlist[0].date_modified,
            wishlist_amount: updatedWishlist[0].wishlist_amount,
            wishlist_date_available: updatedWishlist[0].wishlist_date_available,
            wishlist_date_can_purchase: null,
            wishlist_description: updatedWishlist[0].wishlist_description,
            wishlist_id: updatedWishlist[0].wishlist_id,
            wishlist_priority: updatedWishlist[0].wishlist_priority,
            wishlist_title: updatedWishlist[0].wishlist_title,
            wishlist_url_link: updatedWishlist[0].wishlist_url_link,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([modifiedWishlist]);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting wishlist';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it("should respond with an error message if the cron job id can't be found", async () => {
        // Arrange
        const updatedWishlist = wishlists.filter(
            (wishlist) => wishlist.wishlist_id === 1,
        );

        mockModule(updatedWishlist, undefined, [], [], updatedWishlist);

        jest.mock('../../crontab/deleteCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(),
        }));

        jest.mock('../../crontab/scheduleCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(
                async () =>
                    await Promise.resolve({
                        cronDate: '* * * * *',
                        uniqueId: '1fw34',
                    }),
            ),
        }));

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

        // Call the function with the mock request and response
        await updateWishlistCron(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Cron job not found');
    });
});

describe('DELETE /api/wishlists/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule(
            [{ wishlist_id: 1, cron_job_id: 1 }], // createWishlist result
            undefined, // error message
            [{ uniqueId: 'ws8fgv89w', cronDate: '* * * * *' }], // getCronJob result
        );

        jest.mock('../../crontab/deleteCronJob.js', () => ({
            __esModule: true,
            default: jest.fn(),
        }));

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
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

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

        // Assert that the error was logged on the server side
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the wishlist does not exist', async () => {
        // Arrange
        mockModule([]);

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
