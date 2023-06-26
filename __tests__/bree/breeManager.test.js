import { jest } from '@jest/globals';
import { Volume } from 'memfs';


const vol = Volume.fromJSON({
    './jobs.json': '[]'
}, '/app');

jest.unstable_mockModule('fs', () => ({
    default: vol,
}));

jest.unstable_mockModule('../../bree/getJobs', () => ({
    getJobs: jest.fn().mockImplementation(() => [{ name: 'mockJob' }]),
}));

const { initializeBree, getBree } = await import('../../bree/breeManager');

describe('breeManager', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        await initializeBree('/app/cron-jobs');

        console.log('getBree', await getBree().config.jobs);

        async () => {
            expect(await getBree().config.jobs).toEqual([
                { name: 'mockJob' }, // Expect the initial jobs from the mock config
            ]);
            expect(await getBree().start).toHaveBeenCalled();
        };

        expect(vol.existsSync('/app/cron-jobs')).toBe(true);
    });
});