import { jest } from '@jest/globals';
import { getPayrolls } from '../../getPayrolls.js';

describe('getPayrolls', () => {
    let mockPool;
    let mockPayrollQueries;

    beforeEach(() => {
        // Create a mock pool object with a query method
        mockPool = {
            query: jest.fn(),
        };

        mockPayrollQueries = {
            getAccountIdFromEmployee: 'SELECT account_id FROM employee WHERE id = $1',
            getPayrolls: 'SELECT * FROM payroll WHERE employee_id = $1',
        };
    });

    test('should fetch payrolls correctly', async () => {
        // Mock the result of the pool.query method
        mockPool.query.mockImplementationOnce(() => Promise.resolve({
            rows: [{ account_id: 1 }],
        })).mockImplementationOnce(() => Promise.resolve({
            rows: [{ payroll_id: 1, payroll_amount: 1000 }],
        }));

        const schedulePayrollFunction = (rows, account_id) => {
            return rows.map(row => ({ ...row, account_id }));
        }

        const payrolls = await getPayrolls(1, mockPool, mockPayrollQueries, schedulePayrollFunction);

        // Verify the query method was called with the correct arguments
        expect(mockPool.query).toHaveBeenNthCalledWith(
            1,
            mockPayrollQueries.getAccountIdFromEmployee,
            [1]
        );
        expect(mockPool.query).toHaveBeenNthCalledWith(
            2,
            mockPayrollQueries.getPayrolls,
            [1]
        );

        // Verify the payrolls were fetched correctly
        expect(payrolls).toEqual([{ payroll_id: 1, payroll_amount: 1000, account_id: 1 }]);
    });
});
