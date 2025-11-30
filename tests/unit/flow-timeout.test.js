// Mock chrome.runtime.sendMessage
const mockMsg = vi.fn();
global.chrome = {
  runtime: {
    sendMessage: mockMsg,
    getURL: path => path,
  },
};

// Helper function to simulate the timeout logic we want to implement
async function sendMessageWithTimeout(message, timeout) {
  return Promise.race([
    mockMsg(message),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
  ]);
}

describe('Settings Fetch Timeout', () => {
  it('should return settings when msg resolves quickly', async () => {
    const expectedSettings = { externalApis: { deArrow: { enabled: true } } };
    mockMsg.mockResolvedValue(expectedSettings);

    const result = await sendMessageWithTimeout({ action: 'GET_SETTINGS' }, 1000);
    expect(result).toEqual(expectedSettings);
  });

  it('should throw timeout error when msg hangs', async () => {
    mockMsg.mockImplementation(() => new Promise(() => {})); // Never resolves

    await expect(sendMessageWithTimeout({ action: 'GET_SETTINGS' }, 100)).rejects.toThrow(
      'Timeout'
    );
  });
});
