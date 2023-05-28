import { jest } from '@jest/globals';

const mockStart = jest.fn();
const mockBreeConstructor = jest.fn((config) => {
    return {
        start: mockStart,
        config: {
            jobs: config.jobs,
        },
    };
});

const mockGetJobs = jest.fn().mockResolvedValue([{ name: 'job1' }, { name: 'job2' }]);

jest.unstable_mockModule('cabin', () => ({
    default: jest.fn(),
}));

jest.unstable_mockModule('../../breeManager.js', () => ({
    initializeBree: jest.fn(),
    getBree: jest.fn(),
}));

jest.unstable_mockModule('../../getJobs', () => ({
    default: jest.fn().mockResolvedValue([{ name: 'job1' }, { name: 'job2' }])
}));

const Bree = import('bree');
const { initializeBree, getBree } = await import('../../breeManager');

describe('breeManager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        await initializeBree(mockBreeConstructor, mockGetJobs);

        expect(mockBreeConstructor).toHaveBeenCalledWith({
            logger: expect.anything(),
            root: expect.stringContaining('jobs/cron-jobs'),
        });

        expect(mockGetJobs).toHaveBeenCalled();

        const bree = getBree();
        expect(bree.config.jobs).toEqual([
            { name: 'job1' }, { name: 'job2' }
        ]);
        expect(bree.start).toHaveBeenCalled();
    });
});