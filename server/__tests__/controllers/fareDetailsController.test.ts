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
import { Timeslots } from '../../src/types/types';

jest.mock('../../src/config/winston', () => ({
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

const commuteSystems = [
    {
        commute_system_id: 1,
        name: 'OMNY',
        fare_cap: 33,
        fare_cap_duration: 1,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        commute_system_id: 2,
        name: 'LIRR',
        fare_cap: null,
        fare_cap_duration: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const fareDetails = [
    {
        fare_detail_id: 1,
        commute_system_id: 1,
        system_name: 'OMNY',
        fare_type: 'Single Ride',
        fare_amount: 2.75,
        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        fare_detail_id: 2,
        commute_system_id: 1,
        system_name: 'LIRR',
        fare_type: 'Weekly',
        fare_amount: 33,
        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const timeslots: Timeslots[] = [
    {
        timeslot_id: 1,
        fare_detail_id: 1,
        day_of_week: 0,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
    {
        timeslot_id: 2,
        fare_detail_id: 2,
        day_of_week: 1,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
];

const fareDetailsResponse = [
    {
        id: 1,
        commute_system: {
            commute_system_id: 1,
            name: 'OMNY',
        },
        name: 'Single Ride',
        fare_amount: 2.75,
        timeslots: [
            {
                day_of_week: 0,
                start_time: '00:00:00',
                end_time: '23:59:59',
            },
        ],

        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        commute_system: {
            commute_system_id: 1,
            name: 'LIRR',
        },
        name: 'Weekly',
        fare_amount: 33,
        timeslots: [
            {
                day_of_week: 1,
                start_time: '00:00:00',
                end_time: '23:59:59',
            },
        ],
        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

describe('GET /api/expenses/commute/fares', () => {
    it('should respond with an array of fare details', async () => {
        // Arrange
        mockModule([fareDetails, timeslots]);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        const expectedResponse = {
            fares: fareDetailsResponse,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting fare details';
        mockModule([], [errorMessage]);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
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

    it('should respond with an array of fare details with an id', async () => {
        // Arrange
        mockModule([
            fareDetails.filter((fareDetail) => fareDetail.fare_detail_id === 1),
            timeslots.filter((timeslot) => timeslot.fare_detail_id === 1),
        ]);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        const expectedResponse = {
            fares: fareDetailsResponse.filter(
                (fareDetail) => fareDetail.id === 1,
            ),
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting fare detail for given id';
        mockModule([], [errorMessage]);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.query = { id: 1 };

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
        mockModule([[]]);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
    });
});

describe('POST /api/expenses/commute/fares', () => {
    it('should respond with the new fare detail', async () => {
        mockModule([
            commuteSystems.filter((system) => system.commute_system_id === 1),
            fareDetails.filter((fareDetail) => fareDetail.fare_detail_id === 1),
            timeslots.filter((timeslot) => timeslot.timeslot_id === 1),
        ]);

        const { createFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.body = {
            fare_detail_id: 1,
            commute_system_id: 1,
            system_name: 'OMNY',
            fare_type: 'Single Ride',
            fare_amount: 2.75,
            alternate_fare_detail_id: null,
            timeslots: [
                {
                    day_of_week: 0,
                    start_time: '00:00:00',
                    end_time: '23:59:59',
                },
            ],
            date_created: '2020-01-01',
            date_modified: '2020-01-01',
        };

        await createFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            fareDetailsResponse.filter((fareDetail) => fareDetail.id === 1)[0],
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating fare detail';
        mockModule([], [errorMessage]);

        const { createFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
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
        mockModule([
            fareDetails.filter((fareDetail) => fareDetail.fare_detail_id === 1),
            timeslots.filter((timeslot) => timeslot.timeslot_id === 1),
            [],
            commuteSystems.filter((system) => system.commute_system_id === 1),
        ]);

        const { updateFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            fare_detail_id: 1,
            commute_system_id: 1,
            system_name: 'OMNY',
            fare_type: 'Single Ride',
            fare_amount: 2.75,
            alternate_fare_detail_id: null,
            timeslots: [
                {
                    day_of_week: 0,
                    start_time: '00:00:00',
                    end_time: '23:59:59',
                },
            ],
            date_created: '2020-01-01',
            date_modified: '2020-01-01',
        };

        await updateFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            fareDetailsResponse.filter((fareDetail) => fareDetail.id === 1)[0],
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating fare detail';
        mockModule([], [errorMessage]);

        const { updateFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
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
        mockModule([[]]);

        const { updateFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
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
        mockModule(['Successfully deleted fare detail']);

        const { deleteFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
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
        mockModule([], [errorMessage]);

        const { deleteFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
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
        mockModule([[]]);

        const { deleteFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
    });
});
