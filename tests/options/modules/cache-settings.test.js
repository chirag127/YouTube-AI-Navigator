import { CacheSettings } from '../../../extension/options/modules/cache-settings.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  id: vi.fn(),
  on: vi.fn(),
}));



describe('CacheSettings', () => {
  let settingsManager;
  let autoSave;
  let cacheSettings;
  let mockElements = {};

  beforeEach(() => {
    mockElements = {};
    const mockEl = selector => {
      const elId = selector.replace('#', '');
      if (!mockElements[elId]) {
        mockElements[elId] = {
          value: '',
          checked: false,
          type: 'text',
          addEventListener: vi.fn(),
        };
      }
      return mockElements[elId];
    };

    document.querySelector.mockImplementation(mockEl);
    document.getElementById.mockImplementation(mockEl);

    settingsManager = {
      get: vi.fn().mockReturnValue({}),
    };

    autoSave = {
      attachToAll: vi.fn(),
    };

    cacheSettings = new CacheSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    cacheSettings.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
