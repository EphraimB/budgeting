import { jest } from '@jest/globals';
import * as memfs from 'memfs';
import schedulePayrollCronJob from '../../jobs/schedulePayrollCronJob.js';

// Replace the real fs with memfs
jest.unstable_mockModule('fs', () => {
    const memfs = import('memfs');
    return memfs.fs;
});

describe('schedulePayrollCronJob', () => {
    beforeEach(() => {
        // Setup your in-memory file system
        memfs.vol.fromJSON({
            './jobs.json': '[]',
            'cron-jobs': {},
        }, '/app');
    });

    afterEach(() => {
        // Cleanup: clear the in-memory file system
        memfs.vol.reset();
    });

    it('creates and starts a job', async () => {
        const mockBree = {
            add: jest.fn(),
            start: jest.fn(),
        };

        const mockGetBree = jest.fn().mockReturnValue(mockBree);

        const payrollData = {
            end_date: '2023-12-12T12:12:12Z',
            net_pay: '1200.00',
        };

        const accountId = 1;

        await schedulePayrollCronJob(mockGetBree, payrollData, accountId);

        expect(mockBree.add).toBeCalledTimes(1);
        // Expect the job name to include "payroll-" prefix but it's hard to predict the full uuid, we can check if it starts with the prefix
        expect(mockBree.start.mock.calls[0][0]).toContain('payroll-');

        // Verify that the jobs.json file was written to correctly
        const jobs = JSON.parse(memfs.vol.readFileSync('/app/jobs.json', 'utf-8'));
        expect(jobs).toHaveLength(1);
        expect(jobs[0].name).toContain('payroll-');
        expect(jobs[0].worker.workerData).toEqual({
            account_id: accountId,
            amount: parseFloat(payrollData.net_pay),
            description: 'Payroll',
        });
    });
});
