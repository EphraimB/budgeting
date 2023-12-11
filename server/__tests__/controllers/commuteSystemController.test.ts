import { type Request } from 'express';
import { fareDetails } from '../../models/mockData';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';
import { CommuteSystem } from '../../types/types.js';

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

const commuteSystemsResponse: CommuteSystem[] = [
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

describe('GET /api/expenses/commute/systems', () => {
    it('should respond with an array of systems', async () => {
        // Arrange
        mockModule([commuteSystems]);

        const { getCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteSystemsResponse);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting systems';
        mockModule([], [errorMessage]);

        const { getCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting systems',
        });
    });

    it('should respond with an array of systems with an id', async () => {
        // Arrange
        mockModule([
            commuteSystems.filter((system) => system.commute_system_id === 1),
        ]);

        const { getCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteSystemsResponse.filter((system) => system.id === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting systems';
        mockModule([], [errorMessage]);

        const { getCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting system with id 1',
        });
    });

    it('should respond with a 404 error message when the system does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('System not found');
    });
});

describe('POST /api/expenses/commute/systems', () => {
    it('should respond with the new system', async () => {
        const newSystem = commuteSystems.filter(
            (system) => system.commute_system_id === 1,
        );

        mockModule([newSystem]);

        const { createCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.body = newSystem;

        await createCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteSystemsResponse.filter((system) => system.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating system';
        mockModule([], [errorMessage]);

        const { createCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.body = commuteSystems.filter(
            (system) => system.commute_system_id === 1,
        );

        // Act
        await createCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating system',
        });
    });
});

describe('PUT /api/expenses/commute/systems/:id', () => {
    it('should respond with the updated system', async () => {
        const updatedSystem = commuteSystems.filter(
            (system) => system.commute_system_id === 1,
        );

        mockModule([updatedSystem, updatedSystem]);

        const { updateCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedSystem;

        await updateCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteSystemsResponse.filter((system) => system.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating system';
        mockModule([], [errorMessage]);

        const { updateCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteSystems.filter(
            (system) => system.commute_system_id === 1,
        );

        // Act
        await updateCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating system',
        });
    });

    it('should respond with a 404 error message when the system does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteSystems.filter(
            (system) => system.commute_system_id === 1,
        );

        // Act
        await updateCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('System not found');
    });
});

describe('DELETE /api/expenses/commute/systems/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([commuteSystems, [], 'Successfully deleted system']);

        const { deleteCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted system',
        );
    });

    it('should return a 400 error if there is system related data', async () => {
        // Arrange
        mockModule([
            commuteSystems,
            fareDetails,
            'Successfully deleted system',
        ]);

        const { deleteCommuteSystem } = await import(
            '../../controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'You need to delete system-related data before deleting the system',
        );
    });
});

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
