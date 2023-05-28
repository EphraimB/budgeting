import { jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const jobsFilePath = path.join(__dirname, 'jobs.json');

// Create a sample jobs.json file in the test directory
beforeAll(() => {
    const jobs = [{ name: 'existing-job', cron: '0 0 * * *', path: '/app/jobs/script.js' }];
    jest.unstable_mockModule('fs', () => ({
        default: jest.requireActual('fs'),
        existsSync: jest.fn(() => true),
        readFileSync: jest.fn(() => JSON.stringify(jobs, null, 2)),
        writeFileSync: jest.fn(),
    }));
});

// Delete the jobs.json file from the test directory
afterAll(() => {
    jest.resetModules(); // Reset modules to clear the fs mock
});

// Mock the ./getPayrolls module and provide a mock implementation for the getPayrolls function
jest.unstable_mockModule('../../getPayrolls.js', () => ({
    default: jest.fn(),
}));

describe('getJobs', () => {
    it('should return jobs without calling getPayrolls', async () => {
        const mockQuery = jest.fn((_, callback) => {
            const rows = [{ employee_id: 1 }, { employee_id: 2 }];
            callback(null, { rows });
        });

        jest.unstable_mockModule('../../models/db.js', () => ({
            default: {
                query: mockQuery,
            },
        }));

        const jobs = import('../../getJobs.js');

        expect(jobs).toEqual([
            { name: 'existing-job', cron: '0 0 * * *', path: '/app/jobs/script.js' },
            { name: 'payroll-checker-employee-1', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 1 } } },
            { name: 'payroll-checker-employee-2', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 2 } } },
        ]);

        const { writeFileSync } = require('fs');
        expect(writeFileSync).toHaveBeenCalledWith(jobsFilePath, JSON.stringify(expect.any(Array), null, 2), 'utf8');
    });
});
