import { jest } from '@jest/globals';
import { initializeBree, getBree } from '../../breeManager';

let breeArgs;
let jobsArgs;
let breeStart;

jest.unstable_mockModule('bree', () => {
    return {
        default: jest.fn().mockImplementation((...args) => {
            console.log('Bree mock called');  // <-- Add this
            breeArgs = args[0]; // Capture the arguments
            breeStart = jest.fn();
            return {
                config: {
                    jobs: [],
                },
                start: breeStart,
            };
        }),
    };
});

jest.unstable_mockModule('cabin', () => ({
    default: jest.fn(),
}));

jest.unstable_mockModule('../../breeManager.js', () => ({
    initializeBree: jest.fn(),
    getBree: jest.fn(),
}));

jest.unstable_mockModule('../../getJobs.js', () => ({
    default: jest.fn().mockResolvedValue([{ name: 'job1' }, { name: 'job2' }]),
}));

jest.unstable_mockModule('fs', () => ({
    existsSync: jest.fn().mockReturnValue(false),
    mkdirSync: jest.fn(),
}));

describe('breeManager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Bree correctly', async () => {
        await initializeBree();

        expect(breeArgs).toEqual({
            logger: expect.anything(),
            root: expect.stringContaining('jobs/cron-jobs'),
        });

        expect(jobsArgs).toHaveBeenCalled();

        const breeInstance = getBree();
        expect(breeInstance.config.jobs).toEqual([
            { name: 'job1' }, { name: 'job2' }
        ]);
        expect(breeStart).toHaveBeenCalled();
    });
});
