import { jest } from '@jest/globals';
import { Volume, createFsFromVolume } from 'memfs';

const vol = Volume.fromJSON(
    {
        '/tmp/cronjob.lock': '',
        '/scripts/createTransaction.sh': '',
    },
    '/app',
);

// Create /app/tmp/ directory in vol
vol.mkdirSync('/app/tmp', { recursive: true });

jest.mock('child_process', () => ({
    execSync: jest.fn().mockReturnValue(Buffer.from('')), // mock execSync to return a Buffer
}));

jest.mock('proper-lockfile', () => ({
    lock: jest.fn(async () =>
        jest.fn(async () => {
            await Promise.resolve();
        }),
    ),
    unlock: jest.fn(),
}));

jest.mock('fs', () => createFsFromVolume(vol));

describe('deleteCronJob', () => {
    it('should delete a cron job', async () => {
        const { default: deleteCronJob } = await import(
            '../../crontab/deleteCronJob'
        );
        // Arrange
        const uniqueId = '1234';

        // Act
        await deleteCronJob(uniqueId);

        // Get the keys of the vol.toJSON() object and find the key with the dynamic part
        const dynamicFilePathRegex = /\/app\/tmp\/cronjob\.[a-f0-9-]+\.tmp/;
        const dynamicKey = Object.keys(vol.toJSON()).find((key) =>
            dynamicFilePathRegex.test(key),
        );

        if (!dynamicKey) {
            throw new Error('Dynamic key not found');
        }

        // Assert
        expect(vol.toJSON()).toEqual({
            '/tmp/cronjob.lock': '',
            '/scripts/createTransaction.sh': '',
            [dynamicKey]: '',
        });
    });
});
