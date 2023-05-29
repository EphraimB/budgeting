import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jobsFilePath = path.resolve(__dirname, 'jobs.json');

describe('getJobs', () => {
    beforeAll(() => {
        // Create the jobs.json file in the test directory
        fs.writeFileSync(jobsFilePath, '[]', 'utf8');
    });

    afterAll(() => {
        // Delete the jobs.json file after the test
        fs.unlinkSync(jobsFilePath);
    });

    it('should return just the payroll objects when no jobs.json file exists', async () => {
        // Mock getJobs.js
        jest.unstable_mockModule('../../getJobs.js', () => ({
            getJobs: jest.fn().mockResolvedValue([
                { name: 'payroll-checker-employee-1', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 1 } } },
                { name: 'payroll-checker-employee-2', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 2 } } }
            ]),
        }));

        // Import getJobs dynamically after mocking
        const { getJobs } = await import('../../getJobs.js');

        const jobs = await getJobs(jobsFilePath);

        expect(jobs).toEqual([
            { name: 'payroll-checker-employee-1', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 1 } } },
            { name: 'payroll-checker-employee-2', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 2 } } }
        ]);
    });

    it('should return the payroll objects and the existing jobs when a jobs.json file exists', async () => {
        // Create the jobs.json file in the test directory
        fs.writeFileSync(jobsFilePath, JSON.stringify([
            {
                name: '485fe700-92c3-4cd4-80bf-4289ffc4c2f2',
                cron: '1 16 29 */1 *',
                path: '/app/jobs/cronScriptCreate.js',
                worker: {
                    workerData: {
                        account_id: 1,
                        amount: -250,
                        description: 'This is an expense test',
                        destination_account_id: null
                    }
                }
            }
        ]), 'utf8');

        // Mock getJobs.js
        jest.unstable_mockModule('../../getJobs.js', () => ({
            getJobs: jest.fn().mockResolvedValue([
                { name: 'payroll-checker-employee-1', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 1 } } },
                { name: 'payroll-checker-employee-2', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 2 } } }
            ]),
        }));

        // Import getJobs dynamically after mocking
        const { getJobs } = await import('../../getJobs.js');

        const jobs = await getJobs(jobsFilePath);

        console.log(jobs);

        expect(jobs).toEqual([
            {
                name: '485fe700-92c3-4cd4-80bf-4289ffc4c2f2',
                cron: '1 16 29 */1 *',
                path: '/app/jobs/cronScriptCreate.js',
                worker: {
                    workerData: {
                        account_id: 1,
                        amount: -250,
                        description: 'This is an expense test',
                        destination_account_id: null
                    }
                }
            },
            { name: 'payroll-checker-employee-1', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 1 } } },
            { name: 'payroll-checker-employee-2', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 2 } } }
        ]);
    });
});
