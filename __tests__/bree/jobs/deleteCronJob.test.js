import { jest } from '@jest/globals';
import { Volume } from 'memfs';

jest.unstable_mockModule('../../../bree/breeManager.js', () => ({
    getBree: jest.fn().mockImplementation(() => ({
        config: {
            jobs: [{ name: 'uniqueId' }],
        },
        remove: jest.fn(),
    }))
}));

jest.unstable_mockModule('../../../config/db.js', () => {
    return {
        default: {
            query: jest.fn()
                .mockResolvedValueOnce({ rows: [{ cron_job_id: 1, unique_id: 'uniqueId' }] }) // Success case
                .mockRejectedValueOnce(new Error('Table does not exist')), // Failure case
        },
    }
});

// Mock the file system
const vol = Volume.fromJSON({
    './cron-jobs/uniqueId.js': '',
    './jobs.json': '[{"name": "uniqueId"}]',
}, 'app');

jest.unstable_mockModule('fs', () => ({
    default: vol,
    promises: vol.promises,
}));

const { default: deleteCronJob } = await import('../../../bree/jobs/deleteCronJob.js');

describe('deleteCronJob', () => {
    it('should delete the cron job successfully', async () => {
        const result = await deleteCronJob('cronId', 'app/cron-jobs/uniqueId.js', 'app/jobs.json');

        expect(result).toBe('uniqueId');

        // Check if the file was deleted
        expect(vol.promises.readFile('./cron-jobs/uniqueId.js')).rejects.toThrow();
    });

    it('should throw an error if the cron job does not exist', async () => {
        const result = await deleteCronJob('cronId', 'app/cron-jobs/uniqueId.js', 'app/jobs.json');

        expect(result).toBe(null);
    });
});
