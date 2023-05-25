import { jest } from '@jest/globals';
import { initializeBree, getBree } from '../../breeManager';
import Bree from 'bree';
import Cabin from 'cabin';
import getJobs from '../../getJobs';

jest.unstable_mockModule('bree', () => {
    return jest.fn().mockImplementation(() => {
        return {
            config: {
                jobs: []
            },
            start: jest.fn(),
        };
    });
});

jest.unstable_mockModule('cabin', () => ({
    default: jest.fn(),
}));

jest.unstable_mockModule('../../getJobs', () => ({
    getJobs: jest.fn(),
}));

describe('breeManager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        const mockJobs = [{ name: 'job1' }, { name: 'job2' }];
        getJobs.mockResolvedValue(mockJobs);

        await initializeBree();

        expect(Bree).toHaveBeenCalledWith({
            logger: expect.any(Cabin),
            root: expect.stringContaining('jobs/cron-jobs'),
        });

        const breeInstance = getBree();
        expect(breeInstance.config.jobs).toEqual(mockJobs);
        expect(breeInstance.start).toHaveBeenCalledTimes(1);
    });
});
