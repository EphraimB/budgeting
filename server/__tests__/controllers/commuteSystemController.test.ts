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
        fareCap: 33,
        fareCapDuration: 1,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        name: 'LIRR',
        fareCap: null,
        fareCapDuration: null,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/expenses/commute/systems', () => {
    it('should respond with an array of systems', async () => {
        // Arrange
        mockModule([commuteSystems], commuteSystems);

        const { getCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        // Call the function with the mock request and response
        await getCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteSystems);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        // Act
        await getCommuteSystem(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting systems',
                });
            },
        );
    });
});

describe('GET /api/expenses/commute/systems/:id', () => {
    it('should respond with an array of systems with an id', async () => {
        // Arrange
        mockModule(
            [commuteSystems.filter((system) => system.id === 1)],
            commuteSystems.filter((system) => system.id === 1),
        );

        const { getCommuteSystemById } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getCommuteSystemById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteSystems.filter((system) => system.id === 1)[0],
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteSystemById } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await getCommuteSystemById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting system with id for 1',
                });
            },
        );
    });

    it('should respond with a 404 error message when the system does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getCommuteSystemById } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await getCommuteSystemById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('System not found');
    });
});

describe('POST /api/expenses/commute/systems', () => {
    it('should respond with the new system', async () => {
        const newSystem = commuteSystems.filter((system) => system.id === 1);

        mockModule([newSystem], newSystem);

        const { createCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.body = newSystem;

        await createCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newSystem);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.body = commuteSystems.filter((system) => system.id === 1);

        // Act
        await createCommuteSystem(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error creating system',
                });
            },
        );
    });
});

describe('PUT /api/expenses/commute/systems/:id', () => {
    it('should respond with the updated system', async () => {
        const updatedSystem = commuteSystems.filter(
            (system) => system.id === 1,
        );

        mockModule([[{ id: 1 }], updatedSystem], updatedSystem);

        const { updateCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedSystem;

        await updateCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedSystem);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteSystems.filter((system) => system.id === 1);

        // Act
        await updateCommuteSystem(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error updating system',
                });
            },
        );
    });

    it('should respond with a 404 error message when the system does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteSystems.filter((system) => system.id === 1);

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
        mockModule([[{ id: 1 }], []]);

        const { deleteCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted system',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteSystem(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting system',
                });
            },
        );
    });

    it('should respond with a 404 error message when the system does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteCommuteSystem } = await import(
            '../../src/controllers/commuteSystemController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteSystem(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('System not found');
    });
});
