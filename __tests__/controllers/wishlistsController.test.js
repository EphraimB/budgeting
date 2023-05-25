import { jest } from '@jest/globals';
import request from 'supertest';
import { wishlists } from '../../models/mockData.js'; // Import the mock data

const newWishlist = {
    amount: 100,
    title: 'test',
    description: 'test',
    priority: 1,
};

beforeAll(() => {
    // Mock the breeManager module
    jest.unstable_mockModule('../../breeManager.js', () => ({
        initializeBree: jest.fn(),
        getBree: jest.fn(),
    }));

    // Mock the getJobs module
    jest.unstable_mockModule('../../getJobs.js', () => ({
        default: jest.fn(),
    }));

    jest.unstable_mockModule('../../controllers/wishlistsController.js', () => ({
        getWishlists: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the loans array
                const wishlist = wishlists.filter(wishlist => wishlist.wishlist_id === id);

                // Respond with the filtered array
                response.status(200).json(wishlist);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(wishlists);
            }
        }),
        createWishlist: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newWishlist);
        }),
        updateWishlist: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newWishlist);
        }),
        deleteWishlist: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Wishlist successfully deleted');
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/wishlists', () => {
    it('should respond with the full wishlists array', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/wishlists')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(wishlists);
    });
});

describe('GET /api/wishlists with id query', () => {
    it('should respond with the filtered wishlist array', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/wishlists?id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(wishlists.filter(wishlist => wishlist.wishlist_id === id));
    });
});

describe('POST /api/wishlists', () => {
    it('should respond with the new wishlist', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .post('/api/wishlists')
            .send(newWishlist);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newWishlist);
    });
});

describe('PUT /api/wishlists', () => {
    it('should respond with the updated wishlist', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .put('/api/wishlists/1')
            .send(newWishlist);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newWishlist);
    });
});

describe('DELETE /api/wishlists', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/wishlists/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Wishlist successfully deleted');
    });
});