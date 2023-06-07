import { jest } from '@jest/globals';
import { Volume } from 'memfs';
import { getPayrolls } from '../../getPayrolls.js';

describe('getPayrolls', () => {
    let mockPool;
    let mockPayrollQueries;
    let vol;
    let employeeData;

    beforeEach(() => {
        vol = Volume.fromJSON({
            './jobs.json': '[]',
            'cron-jobs/jobs.js': '',
        }, '/app');

        // Mocked employee data
        employeeData = [
            { employee_id: 1 },
            { employee_id: 2 },
        ];

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

        const payrolls = await getPayrolls(1, mockPool, mockPayrollQueries, schedulePayrollFunction, '/app/jobs.json', vol);

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
