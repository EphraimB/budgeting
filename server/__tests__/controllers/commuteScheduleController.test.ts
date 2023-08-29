import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
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
    executeQueryTwoValue?: QueryResultRow[] | string | null,
    executeQueryThreeValue?: QueryResultRow[] | string | null,
) => {
    const executeQuery = jest.fn();

    if (errorMessage) {
        executeQuery.mockReturnValueOnce(
            Promise.reject(new Error(errorMessage)),
        );
    } else {
        executeQuery.mockReturnValueOnce(Promise.resolve(executeQueryValue));
    }

    if (executeQueryTwoValue) {
        executeQuery.mockReturnValueOnce(Promise.resolve(executeQueryTwoValue));
    }

    if (executeQueryThreeValue) {
        executeQuery.mockReturnValueOnce(
            Promise.resolve(executeQueryThreeValue),
        );
    }

    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
        parseFloatOrFallback,
    }));
};

describe('GET /api/expenses/commute/schedule', () => {
    it('should respond with an array of schedules', async () => {
        const commuteSchedule = [
            {
                commute_schedule_id: 1,
                account_id: 1,
                day_of_week: 1,
                commute_ticket_id: 1,
                start_time: '08:00:00',
                duration: 60,
            },
            {
                commute_schedule_id: 2,
                account_id: 1,
                day_of_week: 1,
                commute_ticket_id: 1,
                start_time: '17:00:00',
                duration: 60,
            },
            {
                commute_schedule_id: 3,
                account_id: 1,
                day_of_week: 2,
                commute_ticket_id: 1,
                start_time: '08:00:00',
                duration: 60,
            },
        ];

        // Arrange
        mockModule(commuteSchedule);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: [
                {
                    day_of_week: 1,
                    passes: [
                        {
                            commute_schedule_id: 1,
                            start_time: '08:00:00',
                            duration: 60,
                        },
                        {
                            commute_schedule_id: 2,
                            start_time: '17:00:00',
                            duration: 60,
                        },
                    ],
                },
                {
                    day_of_week: 2,
                    passes: [
                        {
                            commute_schedule_id: 3,
                            start_time: '08:00:00',
                            duration: 60,
                        },
                    ],
                },
            ],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting schedules';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting schedules',
        });
    });

    it('should respond with an array of systems with an account_id', async () => {
        const commuteSchedule = [
            {
                commute_schedule_id: 1,
                account_id: 1,
                day_of_week: 1,
                commute_ticket_id: 1,
                start_time: '08:00:00',
                duration: 60,
            },
            {
                commute_schedule_id: 3,
                account_id: 1,
                day_of_week: 2,
                commute_ticket_id: 1,
                start_time: '08:00:00',
                duration: 60,
            },
        ];

        // Arrange
        mockModule(commuteSchedule);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: [
                {
                    day_of_week: 1,
                    passes: [
                        {
                            commute_schedule_id: 1,
                            start_time: '08:00:00',
                            duration: 60,
                        },
                    ],
                },
                {
                    day_of_week: 2,
                    passes: [
                        {
                            commute_schedule_id: 3,
                            start_time: '08:00:00',
                            duration: 60,
                        },
                    ],
                },
            ],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });
});

//     it('should handle errors correctly with an account_id', async () => {
//         // Arrange
//         const errorMessage = 'Error getting systems';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { getCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.query = { account_id: 1, id: null };

//         // Act
//         await getCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting system for given account_id',
//         });
//     });

//     it('should respond with an array of systems with an id', async () => {
//         // Arrange
//         mockModule(
//             commuteSystems.filter((system) => system.commute_system_id === 1),
//         );

//         const { getCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.query = { account_id: null, id: 1 };

//         // Call the function with the mock request and response
//         await getCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(
//             commuteSystems.filter((system) => system.commute_system_id === 1),
//         );
//     });

//     it('should handle errors correctly with an id', async () => {
//         // Arrange
//         const errorMessage = 'Error getting systems';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { getCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.query = { account_id: null, id: 1 };

//         // Act
//         await getCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting system',
//         });
//     });

//     it('should respond with a 404 error message when the system does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { getCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.query = { account_id: 3, id: 3 };

//         // Act
//         await getCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('System not found');
//     });
// });

// describe('POST /api/expenses/commute/systems', () => {
//     it('should respond with the new system', async () => {
//         const newSystem = commuteSystems.filter(
//             (system) => system.commute_system_id === 1,
//         );

//         mockModule(newSystem);

//         const { createCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.body = newSystem;

//         await createCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(201);
//         expect(mockResponse.json).toHaveBeenCalledWith(newSystem);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error creating system';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { createCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.body = commuteSystems.filter(
//             (system) => system.commute_system_id === 1,
//         );

//         // Act
//         await createCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error creating system',
//         });
//     });
// });

// describe('PUT /api/expenses/commute/systems/:id', () => {
//     it('should respond with the updated system', async () => {
//         const updatedSystem = commuteSystems.filter(
//             (system) => system.commute_system_id === 1,
//         );

//         mockModule(updatedSystem, undefined, updatedSystem);

//         const { updateCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedSystem;

//         await updateCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(updatedSystem);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error updating system';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { updateCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = commuteSystems.filter(
//             (system) => system.commute_system_id === 1,
//         );

//         // Act
//         await updateCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating system',
//         });
//     });

//     it('should respond with a 404 error message when the system does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { updateCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = commuteSystems.filter(
//             (system) => system.commute_system_id === 1,
//         );

//         // Act
//         await updateCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('System not found');
//     });
// });

// describe('DELETE /api/expenses/commute/systems/:id', () => {
//     it('should respond with a success message', async () => {
//         // Arrange
//         mockModule(
//             commuteSystems,
//             undefined,
//             [],
//             'Successfully deleted system',
//         );

//         const { deleteCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Successfully deleted system',
//         );
//     });

//     it('should return a 400 error if there is system related data', async () => {
//         // Arrange
//         mockModule(
//             commuteSystems,
//             undefined,
//             fareDetails,
//             'Successfully deleted system',
//         );

//         const { deleteCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'You need to delete system-related data before deleting the system',
//         );
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting system';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { deleteCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting system',
//         });
//     });

//     it('should respond with a 404 error message when the system does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deleteCommuteSystem } = await import(
//             '../../controllers/commuteSystemController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteCommuteSystem(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('System not found');
//     });
// });
