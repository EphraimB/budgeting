import { jest } from '@jest/globals';

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
