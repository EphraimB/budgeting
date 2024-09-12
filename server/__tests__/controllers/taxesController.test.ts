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
import { Taxes } from '../../src/types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const taxes = [
    {
        id: 1,
        rate: 0,
        title: 'Test Tax',
        description: 'Test Tax',
        type: 0,
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/taxes', () => {
    it('should respond with an array of taxes', async () => {
        // Arrange
        mockModule([taxes], taxes);

        const { getTaxes } = await import(
            '../../src/controllers/taxesController.js'
        );

        // Call the function with the mock request and response
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(taxes);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getTaxes } = await import(
            '../../src/controllers/taxesController.js'
        );

        // Act
        await getTaxes(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting taxes',
            });
        });
    });
});

describe('GET /api/taxes/:id', () => {
    it('should respond with an array of taxes with id', async () => {
        // Arrange
        mockModule(
            [taxes.filter((tax) => tax.id === 1)],
            taxes.filter((tax) => tax.id === 1),
        );

        const { getTaxesById } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getTaxesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            taxes.filter((tax) => tax.id === 1)[0],
        );
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        mockModule([]);

        const { getTaxesById } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await getTaxesById(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting tax',
            });
        });
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getTaxesById } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await getTaxesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});

describe('POST /api/taxes', () => {
    it('should respond with the new tax', async () => {
        const newTax = taxes.filter((tax) => tax.id === 1);

        mockModule([newTax], newTax);

        const { createTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.body = newTax;

        await createTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            taxes.filter((tax) => tax.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.body = taxes.filter((tax) => tax.id === 1);

        // Act
        await createTax(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating tax',
            });
        });
    });
});

describe('PUT /api/taxes/:id', () => {
    it('should respond with the updated tax', async () => {
        const updatedTax = taxes.filter((tax) => tax.id === 1);

        mockModule([[{ id: 1 }], updatedTax], updatedTax);

        const { updateTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTax;

        await updateTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            taxes.filter((tax) => tax.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = taxes.filter((tax) => tax.id === 1);

        // Act
        await updateTax(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating tax',
            });
        });
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = taxes.filter((tax) => tax.id === 1);

        // Act
        await updateTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});

describe('DELETE /api/taxes/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([[{ id: 1 }], []]);

        const { deleteTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted tax',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteTax(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting tax',
            });
        });
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteTax } = await import(
            '../../src/controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});
