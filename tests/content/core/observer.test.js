vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  on: vi.fn(),
  mo: vi.fn(() => ({ observe: vi.fn() })),
}));

import { initObserver } from '../../../extension/content/core/observer.js';

describe('observer', () => {
  let mockE, mockOn, mockMo;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockE = vi.mocked(await import('../../../extension/utils/shortcuts/log.js')).e;
    mockOn = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).on;
    mockMo = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).mo;

    // Mock location
    Object.defineProperty(window, 'location', {
      value: { href: 'https://www.youtube.com/watch?v=123', pathname: '/watch', search: '?v=123' },
      writable: true,
    });
  });

  describe('initObserver', () => {
    it('should initialize observers', () => {
      initObserver();

      expect(mockMo).toHaveBeenCalledTimes(2);
      expect(mockOn).toHaveBeenCalledWith(document, 'yt-navigate-finish', expect.any(Function));
    });

    it('should handle error', () => {
      mockMo.mockImplementation(() => {
        throw new Error('mo error');
      });

      initObserver();

      expect(mockE).toHaveBeenCalledWith('Err:initObserver', expect.any(Error));
    });
  });
});
