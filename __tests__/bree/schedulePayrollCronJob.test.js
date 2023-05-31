import { jest } from '@jest/globals';
import { Volume } from 'memfs';
import schedulePayrollCronJob from '../../jobs/schedulePayrollCronJob.js';

// Define variables in the outer scope
const vol = Volume.fromJSON({});
const fs = vol;
let mockBree, mockGetBree, payrollData, accountId;

describe('schedulePayrollCronJob', () => {
    beforeAll(async () => {
        mockBree = {
            add: jest.fn(),
            start: jest.fn(),
        };

        mockGetBree = jest.fn().mockReturnValue(mockBree);

        payrollData = {
            end_date: '2023-12-12T12:12:12Z',
            net_pay: '1200.00',
        };

        accountId = 1;

        await schedulePayrollCronJob(mockGetBree, fs, payrollData, accountId);
    });

    it('creates and starts a job', async () => {
        expect(mockBree.add).toBeCalledTimes(1);

        // Expect the job name to include "payroll-" prefix but it's hard to predict the full uuid, we can check if it starts with the prefix
        expect(mockBree.start.mock.calls[0][0]).toContain('payroll-');
    });

    it('writes to the jobs.json file', async () => {
        // Verify that the jobs.json file was written to correctly
        const jobs = JSON.parse(vol.readFileSync('/app/jobs.json', 'utf-8'));
        expect(jobs).toHaveLength(1);
        expect(jobs[0].name).toContain('payroll-');
        expect(jobs[0].worker.workerData).toEqual({
            account_id: accountId,
            amount: parseFloat(payrollData.net_pay),
            description: 'Payroll',
        });
    });
});
