import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jobsFilePath = path.resolve(__dirname, 'jobs.json');

jest.unstable_mockModule('fs', () => ({
    default: jest.requireActual('fs'),
    existsSync: jest.fn((path) => path === jobsFilePath),
    readFileSync: jest.fn((path) => path === jobsFilePath ? '[]' : fs.readFileSync(path)),
    writeFileSync: jest.fn(),
}));

describe('getJobs', () => {
    it('should return an empty jobs object when no jobs.json file exists', async () => {
        // Mock getJobs.js
        jest.doMock('../../getJobs.js', () => ({
            getEmployeesData: jest.fn().mockResolvedValue([
                { employee_id: 1 },
                { employee_id: 2 },
            ]),
            getJobs: jest.requireActual('../../getJobs.js'),
        }));

        // Import getJobs dynamically after mocking
        const { getJobs } = await import('../../getJobs.js');

        const jobs = await getJobs(jobsFilePath);

        expect(jobs).toEqual([
            { name: 'payroll-checker-employee-1', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 1 } } },
            { name: 'payroll-checker-employee-2', cron: '0 0 1 * *', path: '/app/jobs/cronScriptGetPayrolls.js', worker: { workerData: { employee_id: 2 } } }
        ]);

        expect(fs.existsSync).toHaveBeenCalledWith(jobsFilePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jobsFilePath, 'utf8');
        expect(fs.writeFileSync).toHaveBeenCalledWith(jobsFilePath, '[]', 'utf8');
    });
});
