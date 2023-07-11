import { exec } from 'child_process';
import deleteCronJob from '../../crontab/deleteCronJob';

// Create a separate mock module for exec
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

// Mock the behavior of the exec function
const execMock = jest.requireMock('child_process').exec as jest.Mock;

describe('deleteCronJob', () => {
  it('should delete a cron job', async () => {
    // Arrange
    const uniqueId = '1234';
    const mockCallback = jest.fn(); // Create a mock callback function

    // Configure the exec mock implementation to call the provided callback
    execMock.mockImplementation((command: string, callback: any) => {
      callback(null, '', ''); // Call the callback
      return null; // Return null to satisfy the return type of the exec function
    });

    // Act
    await deleteCronJob(uniqueId);

    // Assert
    expect(execMock).toHaveBeenCalledWith('crontab -l', expect.any(Function));
    expect(execMock).toHaveBeenCalledWith(expect.stringContaining('echo "'), expect.any(Function));
  });
});
