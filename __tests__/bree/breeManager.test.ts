import { jest } from '@jest/globals';
import { Volume } from 'memfs';

const vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': ''
}, '/app');

jest.mock('fs', () => ({
    default: vol
}));

jest.mock('../../bree/getJobs', () => ({
    getJobs: jest.fn().mockImplementation(() => [{ name: 'mockJob' }])
}));

describe('breeManager', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        const { initializeBree, getBree } = await import('../../bree/breeManager.js');
        await initializeBree('/app/cron-jobs', '/app/jobs.json');

        expect(await getBree().config.jobs).toEqual([
            { name: 'mockJob' } // Expect the initial jobs from the mock config
        ]);

        expect(vol.existsSync('/app/cron-jobs')).toBe(true);
        expect(vol.existsSync('/app/jobs.json')).toBe(true);
    });
});
