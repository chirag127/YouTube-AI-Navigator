vi.mock('../../../extension/content/handlers/chat.js', () => ({
  sendChatMessage: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  ae: vi.fn(),
  qs: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { attachEventListeners } from '../../../extension/content/handlers/events.js';

describe('attachEventListeners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should attach listeners', async () => {
    const qs = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).qs;
    document.querySelector.mockReturnValueOnce({}); // send button
    document.querySelector.mockReturnValueOnce({}); // input
    const ae = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).ae;

    attachEventListeners();

    expect(ae).toHaveBeenCalledTimes(2);
  });

  it('should handle error', async () => {
    const qs = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).qs;
    document.querySelector.mockImplementation(() => {
      throw new Error('dom error');
    });
    const e = vi.mocked(await import('../../../extension/utils/shortcuts/log.js')).e;

    attachEventListeners();

    expect(e).toHaveBeenCalledWith('Err:attachEventListeners', expect.any(Error));
  });
});
