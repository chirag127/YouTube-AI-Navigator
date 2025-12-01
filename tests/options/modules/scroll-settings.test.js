import { ScrollSettings } from '../../../extension/options/modules/scroll-settings.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));



describe('ScrollSettings', () => {
  let settingsManager;
  let autoSave;
  let scrollSettings;
  let mockElements = {};

  beforeEach(() => {
    mockElements = {};
    document.querySelector.mockImplementation(selector => {
      const id = selector.replace('#', '');
      if (!mockElements[id]) {
        mockElements[id] = {
          value: '',
          checked: false,
          type: 'text',
        };
      }
      return mockElements[id];
    });

    settingsManager = {
      get: vi.fn().mockReturnValue({}),
    };

    autoSave = {
      attachToAll: vi.fn(),
    };

    scrollSettings = new ScrollSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    scrollSettings.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
