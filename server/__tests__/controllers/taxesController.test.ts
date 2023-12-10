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
import { Taxes } from '../../types/types.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;

jest.mock('../../config/winston', () => ({
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
        tax_id: 1,
        tax_rate: 0,
        tax_title: 'Test Tax',
        tax_description: 'Test Tax',
        tax_type: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const taxesResponse: Taxes[] = [
    {
        id: 1,
        tax_rate: 0,
        tax_title: 'Test Tax',
        tax_description: 'Test Tax',
        tax_type: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

describe('GET /api/taxes', () => {
    it('should respond with an array of taxes', async () => {
        // Arrange
        mockModule([taxes]);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(taxesResponse);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting taxes';
        mockModule([], [errorMessage]);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting taxes',
        });
    });

    it('should respond with an array of taxes with id', async () => {
        // Arrange
        mockModule([taxes.filter((tax) => tax.tax_id === 1)]);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            taxesResponse.filter((tax) => tax.id === 1),
        );
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting tax';
        mockModule([], [errorMessage]);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting tax',
        });
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});

describe('POST /api/taxes', () => {
    it('should respond with the new tax', async () => {
        const newTax = taxes.filter((tax) => tax.tax_id === 1);

        mockModule([newTax]);

        const { createTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.body = newTax;

        await createTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            taxesResponse.filter((tax) => tax.id === 1),
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating tax';
        mockModule([], [errorMessage]);

        const { createTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.body = taxes.filter((tax) => tax.tax_id === 1);

        // Act
        await createTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating tax',
        });
    });
});

// describe('PUT /api/taxes/:id', () => {
//     it('should respond with the updated tax', async () => {
//         const updatedTax = taxes.filter((tax) => tax.id === 1);

//         mockModule(updatedTax);

//         const { updateTax } = await import(
//             '../../controllers/taxesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedTax;

//         await updateTax(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(updatedTax);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error updating tax';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { updateTax } = await import(
//             '../../controllers/taxesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = taxes.filter((tax) => tax.id === 1);

//         // Act
//         await updateTax(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating tax',
//         });
//     });

//     it('should respond with a 404 error message when the tax does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { updateTax } = await import(
//             '../../controllers/taxesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = taxes.filter((tax) => tax.id === 1);

//         // Act
//         await updateTax(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
//     });
// });

// describe('DELETE /api/taxes/:id', () => {
//     it('should respond with a success message', async () => {
//         // Arrange
//         mockModule('Successfully deleted tax');

//         const { deleteTax } = await import(
//             '../../controllers/taxesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteTax(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Successfully deleted tax',
//         );
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting tax';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { deleteTax } = await import(
//             '../../controllers/taxesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteTax(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting tax',
//         });
//     });

//     it('should respond with a 404 error message when the tax does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deleteTax } = await import(
//             '../../controllers/taxesController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteTax(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
//     });
// });
