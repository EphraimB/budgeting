import { type Request, type Response } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';
import { FareDetails, Timeslots } from '../../types/types';

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
        day_of_week: 0,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
];

const fareDetailsResponse: any[] = [
    {
        fare_detail_id: 1,
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
        fare_detail_id: 2,
        commute_system: {
            commute_system_id: 1,
            name: 'LIRR',
        },
        name: 'Weekly',
        fare_amount: 33,
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
];

describe('GET /api/expenses/commute/fares', () => {
    it('should respond with an array of fare details', async () => {
        // Arrange
        mockModule([fareDetails, timeslots]);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
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

    it('should respond with an array of fare details with an id', async () => {
        // Arrange
        mockModule([
            fareDetails.filter((fareDetail) => fareDetail.fare_detail_id === 1),
            timeslots.filter((timeslot) => timeslot.fare_detail_id === 1),
        ]);

        const { getFareDetails } = await import(
            '../../controllers/fareDetailsController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Call the function with the mock request and response
        await getFareDetails(mockRequest as Request, mockResponse);

        const expectedResponse = {
            fares: fareDetailsResponse.filter(
                (fareDetail) => fareDetail.fare_detail_id === 1,
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
            '../../controllers/fareDetailsController.js'
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
});

//     it('should respond with a 404 error message when the fare detail does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { getFareDetails } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.query = { id: 3 };

//         // Act
//         await getFareDetails(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
//     });
// });

// describe('POST /api/expenses/commute/fares', () => {
//     it('should respond with the new fare detail', async () => {
//         const newFareDetail = [
//             {
//                 fare_detail_id: 1,
//                 commute_system_id: 1,
//                 system_name: 'BART',
//                 fare_type: 'Adult',
//                 fare_amount: 5.65,
//                 begin_in_effect_day_of_week: 1,
//                 begin_in_effect_time: '00:00:00',
//                 end_in_effect_day_of_week: 7,
//                 end_in_effect_time: '23:59:59',
//                 alternate_fare_detail_id: null,
//                 date_created: '2021-01-01T00:00:00.000Z',
//                 date_modified: '2021-01-01T00:00:00.000Z',
//             },
//         ];

//         mockModule(
//             [{ commute_system_id: 1, name: 'BART' }],
//             undefined,
//             newFareDetail,
//             [
//                 {
//                     timeslot_id: 1,
//                     fare_detail_id: 1,
//                     day_of_week: 1,
//                     start_time: '00:00:00',
//                     end_time: '23:59:59',
//                 },
//             ],
//         );

//         const { createFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.body = {
//             commute_system_id: 1,
//             name: 'Adult',
//             fare_amount: 5.65,
//             timeslots: [
//                 {
//                     day_of_week: 1,
//                     start_time: '00:00:00',
//                     end_time: '23:59:59',
//                 },
//             ],
//             alternate_fare_detail_id: null,
//         };

//         await createFareDetail(mockRequest as Request, mockResponse);

//         const responseObj = {
//             fare_detail_id: 1,
//             commute_system: {
//                 commute_system_id: 1,
//                 name: 'BART',
//             },
//             name: 'Adult',
//             fare_amount: 5.65,
//             timeslots: [
//                 {
//                     day_of_week: 1,
//                     start_time: '00:00:00',
//                     end_time: '23:59:59',
//                 },
//             ],
//             alternate_fare_detail_id: null,
//             date_created: '2021-01-01T00:00:00.000Z',
//             date_modified: '2021-01-01T00:00:00.000Z',
//         };

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(201);
//         expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error creating fare detail';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { createFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.body = fareDetails.filter(
//             (system) => system.fare_detail_id === 1,
//         );

//         // Act
//         await createFareDetail(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error creating fare detail',
//         });
//     });
// });

// describe('PUT /api/expenses/commute/fares/:id', () => {
//     it('should respond with the updated fare detail', async () => {
//         const updatedFareDetail = [
//             {
//                 fare_detail_id: 1,
//                 commute_system_id: 1,
//                 system_name: 'BART',
//                 fare_type: 'Adult',
//                 fare_amount: 5.65,
//                 begin_in_effect_day_of_week: 1,
//                 begin_in_effect_time: '00:00:00',
//                 end_in_effect_day_of_week: 7,
//                 end_in_effect_time: '23:59:59',
//                 alternate_fare_detail_id: null,
//                 date_created: '2021-01-01T00:00:00.000Z',
//                 date_modified: '2021-01-01T00:00:00.000Z',
//             },
//         ];

//         mockModule(
//             updatedFareDetail,
//             undefined,
//             [
//                 {
//                     timeslot_id: 1,
//                     fare_detail_id: 1,
//                     day_of_week: 1,
//                     start_time: '00:00:00',
//                     end_time: '23:59:59',
//                 },
//             ],
//             [],
//             [{ name: 'BART' }],
//         );

//         const { updateFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = {
//             commute_system_id: 1,
//             name: 'Adult',
//             fare_amount: 5.65,
//             timeslots: [
//                 {
//                     day_of_week: 1,
//                     start_time: '00:00:00',
//                     end_time: '23:59:59',
//                 },
//             ],
//             alternate_fare_detail_id: null,
//         };

//         await updateFareDetail(mockRequest as Request, mockResponse);

//         const responseObj = {
//             fare_detail_id: 1,
//             commute_system: {
//                 commute_system_id: 1,
//                 name: 'BART',
//             },
//             name: 'Adult',
//             fare_amount: 5.65,
//             timeslots: [
//                 {
//                     day_of_week: 1,
//                     start_time: '00:00:00',
//                     end_time: '23:59:59',
//                 },
//             ],
//             alternate_fare_detail_id: null,
//             date_created: '2021-01-01T00:00:00.000Z',
//             date_modified: '2021-01-01T00:00:00.000Z',
//         };

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error updating fare detail';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { updateFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = fareDetails.filter(
//             (history) => history.fare_detail_id === 1,
//         );

//         // Act
//         await updateFareDetail(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating fare detail',
//         });
//     });

//     it('should respond with a 404 error message when the fare detail does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { updateFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = fareDetails.filter(
//             (history) => history.fare_detail_id === 1,
//         );

//         // Act
//         await updateFareDetail(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
//     });
// });

// describe('DELETE /api/expenses/commute/fares/:id', () => {
//     it('should respond with a success message', async () => {
//         // Arrange
//         mockModule('Successfully deleted fare detail');

//         const { deleteFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteFareDetail(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Successfully deleted fare detail',
//         );
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting fare detail';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { deleteFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteFareDetail(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting fare detail',
//         });
//     });

//     it('should respond with a 404 error message when the fare details does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deleteFareDetail } = await import(
//             '../../controllers/fareDetailsController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteFareDetail(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Fare detail not found');
//     });
// });
