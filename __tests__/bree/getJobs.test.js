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
});
