import { jest } from '@jest/globals';
import { Volume } from 'memfs';

const vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': ''
}, '/app');

jest.mock('fs', () => ({
    default: vol
}));

jest.mock('../../config/db.js', () => ({
    default: {
        query: jest.fn().mockImplementation(() => Promise.resolve({
            rows: [{
                account_id: 1,
                payroll_id: 1,
                payroll_amount: 1000
            }]
        }))
    }
}));

jest.mock('../../bree/jobs/schedulePayrollCronJob.js', () => ({
    default: jest.fn().mockImplementation(() => Promise.resolve({
        name: 'payroll-checker-employee-1',
        cron: '0 0 1 * *',
        path: '/app/jobs/cronScriptGetPayrolls.js',
        worker: {
            workerData: {
                employee_id: 1
            }
        }
    }))
}));

describe('getPayrolls', () => {
    it('should fetch payrolls correctly', async () => {
        const getPayrollsModule = await import('../../bree/getPayrolls.js');
        const getPayrolls = getPayrollsModule.getPayrolls;
        
        const payrolls = await getPayrolls(1, '/app/jobs.json');

        // Verify the payrolls were fetched correctly
        expect(payrolls).toEqual([{
            name: 'payroll-checker-employee-1',
            cron: '0 0 1 * *',
            path: '/app/jobs/cronScriptGetPayrolls.js',
            worker: {
                workerData: {
                    employee_id: 1
                }
            }
        }]);
    });
});
