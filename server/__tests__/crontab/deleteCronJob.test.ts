import { jest } from '@jest/globals';
import { Volume } from 'memfs';

const vol = Volume.fromJSON({
  '/tmp/cronjob.lock': '',
  '/scripts/createTransaction.sh': '',
}, '/app');

jest.mock('child_process', () => ({
  execSync: jest.fn().mockReturnValue(Buffer.from('')), // mock execSync to return a Buffer
}));

let release = jest.fn();

jest.mock('proper-lockfile', () => ({
  lock: jest.fn(async () => release),
  unlock: jest.fn()
}));

// in your test, you can control the release function:
release = jest.fn(() => Promise.resolve());

jest.mock('fs', () => ({
  default: vol
}));

describe('deleteCronJob', () => {
  it('should delete a cron job', async () => {
    const { default: deleteCronJob } = await import('../../crontab/deleteCronJob');
    // Arrange
    const uniqueId = '1234';

    // Act
    await deleteCronJob(uniqueId);

    // Assert
    expect(vol.toJSON()).toEqual({
      '/tmp/cronjob.lock': '',
      '/scripts/createTransaction.sh': '',
      '/tmp/cronjob.1234.tmp': ''
    });
  });
});
