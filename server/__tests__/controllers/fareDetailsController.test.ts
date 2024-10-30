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
        id: 1,
        name: 'OMNY',
        fare_cap: 33,
        fare_cap_duration: 1,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        name: 'LIRR',
        fare_cap: null,
        fare_cap_duration: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const fareDetails = [
    {
        id: 1,
        station_id: 1,
        system_name: 'OMNY',
        fare_type: 'Single Ride',
        fare: 2.75,
        alternate_fare_details_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        station_id: 1,
        system_name: 'LIRR',
        fare_type: 'Weekly',
        fare: 33,
        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const timeslots = [
    {
        id: 1,
        fare_details_id: 1,
        day_of_week: 0,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
    {
        id: 2,
        fare_details_id: 2,
        day_of_week: 1,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
];

const fareDetailsResponse = [
    {
        id: 1,
        commuteSystem: {
            commuteSystemId: 1,
            name: 'OMNY',
        },
        name: 'Single Ride',
        fare: 2.75,
        timeslots: [
            {
                dayOfWeek: 0,
                startTime: '00:00:00',
                endTime: '23:59:59',
            },
        ],

        alternateFareDetailsId: null,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        commuteSystem: {
            commuteSystemId: 1,
            name: 'LIRR',
        },
        name: 'Weekly',
        fare: 33,
        timeslots: [
            {
                dayOfWeek: 1,
                startTime: '00:00:00',
                endTime: '23:59:59',
            },
        ],
        alternateFareDetailsId: null,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/expenses/commute/fares', () => {
    it('should respond with an array of fare details', async () => {
        // Arrange
        mockModule([fareDetailsResponse], fareDetailsResponse);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(fareDetailsResponse);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getFareDetails } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        // Act
        await getFareDetails(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting fare details',
            });
        });
    });
});

describe('GET /api/expenses/commute/fares/:id', () => {
    it('should respond with an array of fare details with an id', async () => {
        // Arrange
        mockModule(
            [fareDetailsResponse.filter((fareDetail) => fareDetail.id === 1)],
            fareDetailsResponse.filter((fareDetail) => fareDetail.id === 1),
        );

        const { getFareDetailsById } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getFareDetailsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            fareDetailsResponse.filter((fareDetail) => fareDetail.id === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        mockModule([]);

        const { getFareDetailsById } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await getFareDetailsById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting fare details for given id',
                });
            },
        );
    });
});

describe('POST /api/expenses/commute/fares', () => {
    it('should respond with the new fare detail', async () => {
        mockModule(
            [
                [{ id: 1, name: 'OMNY' }],
                [],
                fareDetails.filter((fareDetail) => fareDetail.id === 1),
                timeslots.filter((timeslot) => timeslot.id === 1),
            ],
            {
                commuteSystem: {
                    commuteSystemId: 1,
                    name: 'OMNY',
                },
                name: 'Single ride',
                timeslots: [
                    {
                        dayOfWeek: 0,
                        startTime: '00:00:00',
                        endTime: '23:59:59',
                    },
                ],
            },
        );

        const { createFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.body = {
            systemName: 'OMNY',
            fareType: 'Single Ride',
            fare: 2.75,
            timeslots: [
                {
                    dayOfWeek: 0,
                    startTime: '00:00:00',
                    endTime: '23:59:59',
                },
            ],
        };

        await createFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            stationId: 1,
            commuteSystemName: 'OMNY',
            name: 'Single Ride',
            fare: 2.75,
            alternateFareDetailsId: null,
            timeslots: [
                {
                    dayOfWeek: 0,
                    startTime: '00:00:00',
                    endTime: '23:59:59',
                },
            ],
            dateCreated: '2020-01-01',
            dateModified: '2020-01-01',
        });
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.body = fareDetails.filter(
            (fareDetail) => fareDetail.id === 1,
        );

        // Act
        await createFareDetail(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error creating fare detail',
                });
            },
        );
    });
});

describe('PUT /api/expenses/commute/fares/:id', () => {
    it('should respond with the updated fare detail', async () => {
        mockModule(
            [
                [{ id: 1 }],
                commuteSystems.filter(
                    (commuteSystem) => commuteSystem.id === 1,
                ),
                timeslots.filter((timeslot) => timeslot.id === 1),
                [],
                [],
                fareDetails.filter((fareDetail) => fareDetail.id === 1),
                [],
            ],
            undefined,
            undefined,
            {
                toInsert: [
                    {
                        dayOfWeek: 0,
                        startTime: '00:00:00',
                        endTime: '23:59:59',
                    },
                ],
                toDelete: [],
                toUpdate: [],
            },
        );

        const { updateFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            commuteSystemId: 1,
            commuteSystemName: 'OMNY',
            name: 'Single Ride',
            fare: 2.75,
            alternateFareDetailsId: null,
            timeslots: [
                {
                    dayOfWeek: 0,
                    startTime: '00:00:00',
                    endTime: '23:59:59',
                },
            ],
            dateCreated: '2020-01-01',
            dateModified: '2020-01-01',
        };

        await updateFareDetail(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: 1,
            stationId: 1,
            commuteSystemName: 'OMNY',
            name: 'Single Ride',
            fare: 2.75,
            alternateFareDetailsId: null,
            timeslots: [
                {
                    dayOfWeek: 0,
                    startTime: '00:00:00',
                    endTime: '23:59:59',
                },
            ],
            dateCreated: '2020-01-01',
            dateModified: '2020-01-01',
        });
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = fareDetails.filter((history) => history.id === 1);

        // Act
        await updateFareDetail(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error updating fare detail',
                });
            },
        );
    });

    it('should respond with a 404 error message when the fare detail does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = fareDetails.filter((history) => history.id === 1);

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
        mockModule([[{ id: 1 }], [], [], []]);

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
        mockModule([]);

        const { deleteFareDetail } = await import(
            '../../src/controllers/fareDetailsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteFareDetail(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting fare detail',
                });
            },
        );
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
