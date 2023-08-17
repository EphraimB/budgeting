import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { fareDetails } from '../../models/mockData';
import { type QueryResultRow } from 'pg';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../utils/helperFunctions';

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
    },
}));

// Mock request and response
let mockRequest: any;
let mockResponse: any;

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

/**
 *
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    executeQueryValue: QueryResultRow[] | string | null,
    errorMessage?: string,
) => {
    const executeQuery =
        errorMessage !== null && errorMessage !== undefined
            ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
            : jest.fn(async () => await Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
        parseFloatOrFallback,
    }));
};

describe('GET /api/expenses/commute/fares', () => {
    it('should respond with an array of fare details', async () => {
        // Arrange
        mockModule(fareDetails);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        const responseObj = {
            fares_by_account: [
                fareDetails.map((fareDetail) => ({
                    account_id: fareDetail.account_id,
                    fares: [
                        {
                            fare_detail_id: 1,
                            commute_system: {
                                commute_system_id: fareDetail.commute_system_id,
                                name: fareDetail.system_name,
                            },
                            name: fareDetail.fare_type,
                            fare_amount: fareDetail.fare_amount,
                            begin_in_effect: {
                                day_of_week:
                                    fareDetail.begin_in_effect_day_of_week,
                                time: fareDetail.begin_in_effect_time,
                            },
                            end_in_effect: {
                                day_of_week:
                                    fareDetail.end_in_effect_day_of_week,
                                time: fareDetail.end_in_effect_time,
                            },
                            date_created: fareDetail.date_created,
                            date_modified: fareDetail.date_modified,
                        },
                    ],
                })),
            ],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting fare details';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Act
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting fare details',
        });
    });

    it('should respond with an array of fare details with an account_id', async () => {
        // Arrange
        mockModule(
            fareDetails.filter((fareDetail) => fareDetail.account_id === 1),
        );

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            fareDetails.filter((fareDetail) => fareDetail.account_id === 1),
        );
    });

    it('should handle errors correctly with an account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting fare detail for given account_id';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Act
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting fare details for given account_id',
        });
    });

    it('should respond with an array of fare details with an id', async () => {
        // Arrange
        mockModule(
            fareDetails.filter((fareDetail) => fareDetail.fare_detail_id === 1),
        );

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            fareDetails.filter((fareDetail) => fareDetail.fare_detail_id === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting fare detail for given id';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Act
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting fare details for given id',
        });
    });

    it('should respond with a 404 error message when the fare detail does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: 3, id: 3 };

        // Act
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
    });
});

describe('POST /api/expenses/commute/fares', () => {
    it('should respond with the new fare detail', async () => {
        const newFareDetail = fareDetails.filter(
            (system) => system.fare_detail_id === 1,
        );

        mockModule(newFareDetail);

        const { createFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.body = newFareDetail;

        await createFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newFareDetail);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating fare detail';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.body = fareDetails.filter(
            (system) => system.fare_detail_id === 1,
        );

        // Act
        await createFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating fare detail',
        });
    });
});

describe('PUT /api/expenses/commute/fares/:id', () => {
    it('should respond with the updated fare detail', async () => {
        const updatedFareDetail = fareDetails.filter(
            (history) => history.fare_detail_id === 1,
        );

        mockModule(updatedFareDetail);

        const { updateFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedFareDetail;

        await updateFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedFareDetail);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating fare detail';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = fareDetails.filter(
            (history) => history.fare_detail_id === 1,
        );

        // Act
        await updateFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating fare detail',
        });
    });

    it('should respond with a 404 error message when the fare detail does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = fareDetails.filter(
            (history) => history.fare_detail_id === 1,
        );

        // Act
        await updateFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
    });
});

describe('DELETE /api/expenses/commute/fares/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted fare detail');

        const { deleteFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted fare detail',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting fare detail';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting fare detail',
        });
    });

    it('should respond with a 404 error message when the fare details does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteFareDetail } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
    });
});
