import { Volume } from 'memfs';
import { jest } from '@jest/globals';

let vol, getJobs, employeeData, getJobsModule;

vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': '',
}, '/app');

// Mocked employee data
employeeData = [
    { employee_id: 1 },
    { employee_id: 2 },
];

jest.unstable_mockModule('../../getPayrolls.js', () => ({
    getPayrolls: jest.fn().mockImplementation(() => {
        return [];
    })
}));

jest.unstable_mockModule('../../getEmployeesData.js', () => ({
    getEmployeesData: jest.fn().mockImplementation(() => {
        return employeeData;
    })
}));

const createJob = (name, cron, path, workerData) => {
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
        getJobsModule = await import('../../getJobs.js'); // Adjust the path as needed
        getJobs = getJobsModule.getJobs;
    });

    afterEach(() => {
        jest.resetModules();
    });

    it('should return just the payroll objects when no jobs.json file exists', async () => {
        const jobs = await getJobs('/app/jobs.json');

        expect(jobs).toEqual([
            createJob('payroll-checker-employee-1', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-2', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 2 })
        ]);
    });

    it('should return the payroll objects and the existing jobs when a jobs.json file exists', async () => {
        vol.writeFileSync('/app/jobs.json', createJob('payroll-fesgersg', '0 0 1 * *', '/app/jobs/cronScriptCreate.js', { employee_id: 1 }), 'utf8');

        const jobs = await getJobs('/app/jobs.json');

        expect(jobs).toEqual([
            createJob('payroll-fesgersg', '0 0 1 * *', '/app/jobs/cronScriptCreate.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-1', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-2', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 2 })
        ]);
    });
});
