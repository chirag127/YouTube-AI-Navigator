vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/content/core/state.js', () => ({
  loadSettings: vi.fn(),
}));

vi.mock('../../../extension/content/core/observer.js', () => ({
  initObserver: vi.fn(),
}));

vi.mock('../../../extension/content/features/auto-liker.js', () => ({
  autoLiker: { init: vi.fn() },
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  on: vi.fn(),
}));

import { initializeExtension, waitForPageReady } from '../../../extension/content/core/init.js';

describe('init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeExtension', () => {
    it('should initialize successfully', async () => {
      const loadSettings = (await import('../../../extension/content/core/state.js')).loadSettings;
      loadSettings.mockResolvedValue();
      const initObserver = (await import('../../../extension/content/core/observer.js'))
        .initObserver;
      const autoLiker = (await import('../../../extension/content/features/auto-liker.js'))
        .autoLiker;

      const result = await initializeExtension();

      expect(result).toBe(true);
      expect(loadSettings).toHaveBeenCalled();
      expect(initObserver).toHaveBeenCalled();
      expect(autoLiker.init).toHaveBeenCalled();
    });

    it('should handle autoLiker error', async () => {
      const loadSettings = (await import('../../../extension/content/core/state.js')).loadSettings;
      loadSettings.mockResolvedValue();
      const autoLiker = (await import('../../../extension/content/features/auto-liker.js'))
        .autoLiker;
      autoLiker.init.mockImplementation(() => {
        throw new Error('autoLiker error');
      });
      const e = (await import('../../../extension/utils/shortcuts/log.js')).e;

      const result = await initializeExtension();

      expect(result).toBe(true);
      expect(e).toHaveBeenCalledWith('Err:initializeExtension:autoLiker', expect.any(Error));
    });

    it('should handle loadSettings error', async () => {
      const loadSettings = (await import('../../../extension/content/core/state.js')).loadSettings;
      loadSettings.mockRejectedValue(new Error('loadSettings error'));
      const e = (await import('../../../extension/utils/shortcuts/log.js')).e;

      const result = await initializeExtension();

      expect(result).toBe(false);
      expect(e).toHaveBeenCalledWith('Err:initializeExtension', expect.any(Error));
    });
  });

  describe('waitForPageReady', () => {
    it('should resolve immediately if readyState is complete', async () => {
      Object.defineProperty(document, 'readyState', { value: 'complete', writable: true });

      const result = await waitForPageReady();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should wait for load event', async () => {
      Object.defineProperty(document, 'readyState', { value: 'loading', writable: true });
      const on = (await import('../../../extension/utils/shortcuts/dom.js')).on;
      on.mockImplementation((el, event, cb) => cb());

      await waitForPageReady();

      expect(on).toHaveBeenCalledWith(window, 'load', expect.any(Function));
    });

    it('should handle error', async () => {
      Object.defineProperty(document, 'readyState', { value: 'loading', writable: true });
      const on = (await import('../../../extension/utils/shortcuts/dom.js')).on;
      on.mockImplementation(() => {
        throw new Error('dom error');
      });
      const e = (await import('../../../extension/utils/shortcuts/log.js')).e;

      await expect(waitForPageReady()).rejects.toThrow('dom error');
      expect(e).toHaveBeenCalledWith('Err:waitForPageReady', expect.any(Error));
    });
  });
});
