import { jest } from '@jest/globals';

const mockGetJobs = jest.fn().mockResolvedValue([{ name: 'job1' }, { name: 'job2' }]);

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
    default: mockGetJobs,
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
        expect(getBree().start).toHaveBeenCalled();
    });
});
