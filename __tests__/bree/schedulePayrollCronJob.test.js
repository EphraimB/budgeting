import { jest } from '@jest/globals';
import { Volume } from 'memfs';
import schedulePayrollCronJob from '../../jobs/schedulePayrollCronJob.js';

const vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': '',
}, '/app');

let mockBree, mockGetBree, payrollData, accountId, jobs;

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

        jobs = await schedulePayrollCronJob(payrollData, accountId, mockGetBree, vol, '/app/cron-jobs/job.js', '/app/jobs.json');
    });

    it('creates and starts a job', async () => {
        // Expect the job name to include "payroll-" prefix but it's hard to predict the full uuid, we can check if it starts with the prefix
        expect(jobs.name).toContain('payroll-');
    });
});
