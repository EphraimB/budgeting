import schedulePayrollCronJob from '../../jobs/schedulePayrollCronJob.js';
import { jest } from '@jest/globals';

describe('schedulePayrollCronJob', () => {
    it('creates and starts a job', async () => {
        const mockFs = {
            existsSync: jest.fn().mockReturnValue(true),
            readFileSync: jest.fn().mockReturnValue(JSON.stringify([])),
            writeFileSync: jest.fn(),
            closeSync: jest.fn(),
            openSync: jest.fn()
        };

        const mockBree = {
            add: jest.fn(),
            start: jest.fn()
        };

        const mockGetBree = jest.fn().mockReturnValue(mockBree);

        const payrollData = {
            end_date: '2023-12-12T12:12:12Z',
            net_pay: '1200.00'
        };

        const accountId = 1;

        await schedulePayrollCronJob(mockGetBree, mockFs, payrollData, accountId);

        expect(mockBree.add).toBeCalledTimes(1);
        // Expect the job name to include "payroll-" prefix but it's hard to predict the full uuid, we can check if it starts with the prefix
        expect(mockBree.start.mock.calls[0][0]).toContain('payroll-');
    });
});
