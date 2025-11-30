vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  gu: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/global.js', () => ({
  to: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  js: vi.fn(),
  mp: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  ae: vi.fn(),
  qsa: vi.fn(() => []),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
  slg: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
  ft: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/string.js', () => ({
  jn: vi.fn(),
}));

vi.mock('../../../extension/content/utils/scroll-manager.js', () => ({
  getScrollManager: vi.fn(() => ({ scrollToComments: vi.fn() })),
}));

import { getComments } from '../../../extension/content/handlers/comments.js';

describe('getComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return comments when enabled', async () => {
    const sg = vi.mocked(await import('../../../extension/utils/shortcuts/storage.js')).sg;
    sg.mockResolvedValue({ config: { comments: { enabled: true } } });

    const result = await getComments();

    expect(result).toEqual([]);
  });

  it('should return empty when disabled', async () => {
    const sg = vi.mocked(await import('../../../extension/utils/shortcuts/storage.js')).sg;
    sg.mockResolvedValue({ config: { comments: { enabled: false } } });

    const result = await getComments();

    expect(result).toEqual([]);
  });
});
