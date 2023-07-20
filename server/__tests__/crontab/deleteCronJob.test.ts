import { jest } from '@jest/globals';
import { execSync } from 'child_process';
import { lock } from 'proper-lockfile';
import { writeFileSync } from 'fs';
import deleteCronJob from '../../crontab/deleteCronJob';

jest.mock('child_process', () => ({
  execSync: jest.fn().mockReturnValue(Buffer.from('')), // mock execSync to return a Buffer
}));

jest.mock('proper-lockfile', () => ({
  lock: jest.fn(),
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

const execSyncMock = execSync as jest.MockedFunction<typeof execSync>;
const lockMock = lock as jest.MockedFunction<typeof lock>;
const writeFileSyncMock = writeFileSync as jest.MockedFunction<typeof writeFileSync>;

describe('deleteCronJob', () => {
  it('should delete a cron job', async () => {
    // Arrange
    const uniqueId = '1234';
    lockMock.mockResolvedValue(() => Promise.resolve());  // Mock lock to resolve to a function that returns a Promise

    // Act
    await deleteCronJob(uniqueId);

    // Assert
    expect(lockMock).toHaveBeenCalledWith('/app/tmp/cronjob.lock');
    expect(execSyncMock).toHaveBeenNthCalledWith(1, 'crontab -l');
    expect(writeFileSyncMock).toHaveBeenCalled();
    expect(execSyncMock).toHaveBeenNthCalledWith(2, expect.stringContaining('crontab'));
  });
});
