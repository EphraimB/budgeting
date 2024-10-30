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

const commuteStations = [
    {
        id: 1,
        commuteSystemId: 1,
        fromStation: '7th Av',
        toStation: '34 St-Penn Station',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        commuteSystemId: 1,
        fromStation: '34 St-Penn Station',
        toStation: '7th Av',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/expenses/commute/stations', () => {
    it('should respond with an array of stations', async () => {
        // Arrange
        mockModule([commuteStations], commuteStations);

        const { getStations } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        // Call the function with the mock request and response
        await getStations(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteStations);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getStations } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        // Act
        await getStations(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting stations',
            });
        });
    });
});

describe('GET /api/expenses/commute/stations/:id', () => {
    it('should respond with an object of a single station with an id', async () => {
        // Arrange
        mockModule(
            [commuteStations.filter((station) => station.id === 1)],
            commuteStations.filter((station) => station.id === 1),
        );

        const { getStationById } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getStationById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteStations.filter((system) => system.id === 1),
        );
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        mockModule([]);

        const { getStationById } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await getStationById(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting station with id for 1',
            });
        });
    });

    it('should respond with a 404 error message when the station does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getStationById } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await getStationById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Station not found');
    });
});

describe('POST /api/expenses/commute/stations', () => {
    it('should respond with the new station', async () => {
        const newStation = commuteStations.filter(
            (station) => station.id === 1,
        );

        mockModule([newStation], newStation);

        const { createStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.body = newStation;

        await createStation(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newStation);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.body = commuteStations.filter((system) => system.id === 1);

        // Act
        await createStation(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating station',
            });
        });
    });
});

describe('PUT /api/expenses/commute/stations/:id', () => {
    it('should respond with the updated station', async () => {
        const updatedStation = commuteStations.filter(
            (station) => station.id === 1,
        );

        mockModule([[{ id: 1 }], updatedStation], updatedStation);

        const { updateStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedStation;

        await updateStation(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedStation);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteStations.filter(
            (station) => station.id === 1,
        );

        // Act
        await updateStation(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating station',
            });
        });
    });

    it('should respond with a 404 error message when the station does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = commuteStations.filter((system) => system.id === 1);

        // Act
        await updateStation(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Station not found');
    });
});

describe('DELETE /api/expenses/commute/systems/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([[{ id: 1 }], []]);

        const { deleteStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteStation(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted station',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteStation(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting station',
            });
        });
    });

    it('should respond with a 404 error message when the station does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteStation } = await import(
            '../../src/controllers/commuteStationsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteStation(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Station not found');
    });
});
