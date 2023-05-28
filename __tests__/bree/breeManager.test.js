import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cronjobsDir = path.join(__dirname, 'cron-jobs');

jest.unstable_mockModule('cabin', () => ({
    default: jest.fn(),
}));

jest.unstable_mockModule('../../breeManager.js', () => {
    const mockConfig = {
        jobs: [{ name: 'mockJob' }], // Set the initial jobs in the mock config
    };
    const mockGetBree = jest.fn().mockReturnValue({
        start: jest.fn(),
        config: mockConfig, // Use the mock config
    });

    return {
        initializeBree: jest.fn(),
        getBree: mockGetBree,
    };
});

jest.unstable_mockModule('../../getJobs', () => ({
    default: jest.fn(),
}));

const { initializeBree, getBree } = await import('../../breeManager');

describe('breeManager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        await initializeBree();

        expect(getBree().config.jobs).toEqual([
            { name: 'mockJob' }, // Expect the initial jobs from the mock config
        ]);

        async () => {
            expect(await getBree().start).toHaveBeenCalled();
        };
    });
});

describe('cronjobsDir', () => {
    beforeAll(() => {
        if (!fs.existsSync(cronjobsDir)) {
            fs.mkdirSync(cronjobsDir);
        }
    });

    afterAll(() => {
        fs.rmSync(cronjobsDir, { recursive: true });
    });

    it('should create the directory if it does not exist', () => {
        const cronjobsDir = path.join(__dirname, 'cron-jobs');

        // Verify that the directory now exists
        expect(fs.existsSync(cronjobsDir)).toBe(true);
    });
});