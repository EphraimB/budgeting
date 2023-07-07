import { Volume } from 'memfs';
import { jest } from '@jest/globals';
import { Job, JobOptions } from 'bree';

let getJobs: (jobsFilePath?: string) => Promise<JobOptions[]>, getJobsModule;

const vol = Volume.fromJSON({
    'bree/jobs.json': '[]',
    'bree/cron-jobs/jobs.js': ''
}, '/app');

// Mocked employee data
const employeeData = [
    { employee_id: 1 },
    { employee_id: 2 }
];

jest.mock('fs', () => ({
    default: vol
}));

jest.mock('../../bree/getPayrolls.js', () => ({
    getPayrolls: jest.fn().mockImplementation(() => {
        return [];
    })
}));

jest.mock('../../bree/getEmployeesData.js', () => ({
    getEmployeesData: jest.fn().mockImplementation(() => {
        return employeeData;
    })
}));

const createJob = (name: string, cron: string, path: string, workerData: any): JobOptions => {
    return {
        name,
        cron,
        path,
        worker: {
            workerData
        }
    };
};

describe('getJobs', () => {
    beforeEach(async () => {
        getJobsModule = await import('../../bree/getJobs.js'); // Adjust the path as needed
        getJobs = getJobsModule.getJobs;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return just the payroll objects when no jobs.json file exists', async () => {
        const jobs: JobOptions[] = await getJobs('/app/bree/jobs.json');

        expect(jobs).toEqual([
            createJob('payroll-checker-employee-1', '0 0 1 * *', '/app/bree/jobs/scripts/cronScriptGetPayrolls.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-2', '0 0 1 * *', '/app/bree/jobs/scripts/cronScriptGetPayrolls.js', { employee_id: 2 })
        ]);
    });

    it('should return the payroll objects and the existing jobs when a jobs.json file exists', async () => {
        vol.writeFileSync('/app/bree/jobs.json', JSON.stringify([createJob('payroll-fesgersg', '0 0 1 * *', '/app/bree/jobs/scripts/cronScriptCreate.js', { employee_id: 1 })]), { encoding: 'utf8' });

        const jobs = await getJobs('/app/bree/jobs.json');

        expect(jobs).toEqual([
            createJob('payroll-fesgersg', '0 0 1 * *', '/app/bree/jobs/scripts/cronScriptCreate.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-1', '0 0 1 * *', '/app/bree/jobs/scripts/cronScriptGetPayrolls.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-2', '0 0 1 * *', '/app/bree/jobs/scripts/cronScriptGetPayrolls.js', { employee_id: 2 })
        ]);
    });
});
