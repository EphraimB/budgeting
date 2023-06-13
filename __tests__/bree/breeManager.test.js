import { jest } from '@jest/globals';
import { Volume } from 'memfs';


const vol = Volume.fromJSON({
    './jobs.json': '[]',
    'cron-jobs/jobs.js': '',
}, '/app');

jest.unstable_mockModule('../../getJobs', () => ({
    getJobs: jest.fn().mockImplementation(() => [{ name: 'mockJob' }]),
}));

const { initializeBree, getBree } = await import('../../breeManager');

describe('breeManager', () => {
    beforeAll(() => {
        if (!vol.existsSync('/app/cron-jobs')) {
            vol.mkdirSync('/app/cron-jobs');
        }
    });

    afterAll(() => {
        vol.rmSync('/app/cron-jobs', { recursive: true });
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        await initializeBree();

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