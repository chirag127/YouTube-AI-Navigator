import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../extension/content/core/state.js', () => ({
  state: { currentTranscript: [{ text: 'test' }] },
}));

vi.mock('../../../extension/content/ui/renderers/chat.js', () => ({
  addChatMessage: vi.fn(),
}));

vi.mock('../../../extension/lib/marked-loader.js', () => ({
  parseMarkdown: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  rs: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
  am: vi.fn(),
  ajn: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { sendChatMessage } from '../../../extension/content/handlers/chat.js';

describe('sendChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send message successfully', async () => {
    const qs = (vi.mocked(await import('../../../extension/utils/shortcuts/dom.js'))).qs;
    qs.mockReturnValue({ value: 'question' });
    const addChatMessage = (vi.mocked(await import('../../../extension/content/ui/renderers/chat.js'))).addChatMessage;
    addChatMessage.mockResolvedValue();
    addChatMessage.mockResolvedValue({ innerHTML: '' });
    const rs = (vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js'))).rs;
    rs.mockResolvedValue({ success: true, answer: 'answer' });
    const parseMarkdown = (vi.mocked(await import('../../../extension/lib/marked-loader.js'))).parseMarkdown;
    parseMarkdown.mockResolvedValue('parsed');

    await sendChatMessage();

    expect(addChatMessage).toHaveBeenCalledWith('user', 'question');
    expect(rs).toHaveBeenCalledWith({ action: 'CHAT_WITH_VIDEO', question: 'question', context: expect.any(String), metadata: null });
    expect(parseMarkdown).toHaveBeenCalledWith('answer');
  });

  it('should handle error', async () => {
    const qs = (vi.mocked(await import('../../../extension/utils/shortcuts/dom.js'))).qs;
    qs.mockReturnValue({ value: 'question' });
    const addChatMessage = (vi.mocked(await import('../../../extension/content/ui/renderers/chat.js'))).addChatMessage;
    addChatMessage.mockResolvedValue();
    addChatMessage.mockResolvedValue({ textContent: '' });
    const rs = (vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js'))).rs;
    rs.mockRejectedValue(new Error('chat error'));
    const e = (vi.mocked(await import('../../../extension/utils/shortcuts/log.js'))).e;

    await sendChatMessage();

    expect(e).toHaveBeenCalledWith('Err:sendChatMessage', expect.any(Error));
  });
});
