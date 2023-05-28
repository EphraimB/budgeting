import { jest } from '@jest/globals';
import Cabin from 'cabin';
import getJobs from '../../getJobs';

const mockStart = jest.fn();
jest.unstable_mockModule('bree', () => ({
    default: jest.fn().mockImplementation((config) => {
        return {
            config,
            start: mockStart,
        };
    })
}));

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
        await initializeBree();

        expect(Bree).toHaveBeenCalledWith({
            logger: expect.any(Cabin),
            root: expect.stringContaining('jobs/cron-jobs'),
        });

        expect(getJobs).toHaveBeenCalled();

        const bree = getBree();
        expect(bree.config.jobs).toEqual([
            { name: 'job1' }, { name: 'job2' }
        ]);
        expect(bree.start).toHaveBeenCalled();
    });
});
