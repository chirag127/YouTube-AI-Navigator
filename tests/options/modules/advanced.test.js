import { AdvancedSettings } from '../../../extension/options/modules/advanced.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  id: vi.fn(),
  on: vi.fn(),
}));



describe('AdvancedSettings', () => {
  let settingsManager;
  let autoSave;
  let advancedSettings;
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
      reset: vi.fn(),
      export: vi.fn(),
      import: vi.fn(),
    };

    autoSave = {
      attachToAll: vi.fn(),
    };

    advancedSettings = new AdvancedSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    advancedSettings.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
