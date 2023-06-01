import { Volume } from 'memfs';
import { jest } from '@jest/globals';
import { getJobs } from '../../getJobs.js'; // Adjust the path as needed

let vol;
let getPayrolls;
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

    getPayrolls = jest.fn();

    // Ensure that the jobs.json file is reset before each test
    vol.writeFileSync('/app/jobs.json', '[]');
});

afterEach(() => {
    // Clear all instances and calls to constructor and all methods
    getPayrolls.mockClear();
});

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
    it('should return just the payroll objects when no jobs.json file exists', async () => {
        const jobs = await getJobs(employeeData, getPayrolls, '/app/jobs.json', vol);

        expect(jobs).toEqual([
            createJob('payroll-checker-employee-1', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-2', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 2 })
        ]);
    });

    it('should return the payroll objects and the existing jobs when a jobs.json file exists', async () => {
        // Create the jobs.json file in the test directory
        const existingJob = createJob('485fe700-92c3-4cd4-80bf-4289ffc4c2f2', '1 16 29 */1 *', '/app/jobs/cronScriptCreate.js', {
            account_id: 1,
            amount: -250,
            description: 'This is an expense test',
            destination_account_id: null
        });
        vol.writeFileSync('/app/jobs.json', JSON.stringify([existingJob]), 'utf8');

        const jobs = await getJobs(employeeData, getPayrolls, '/app/jobs.json', vol);

        expect(jobs).toEqual([
            existingJob,
            createJob('payroll-checker-employee-1', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 1 }),
            createJob('payroll-checker-employee-2', '0 0 1 * *', '/app/jobs/cronScriptGetPayrolls.js', { employee_id: 2 })
        ]);
    });
});
