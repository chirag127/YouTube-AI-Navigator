import { IntegrationsSettings } from '../../../extension/options/modules/integrations.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  __esModule: true,
  qs: vi.fn(),
  id: vi.fn(),
  ce: vi.fn(),
}));



describe('IntegrationsSettings', () => {
  let settingsManager;
  let notificationManager;
  let integrationsSettings;
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
          appendChild: vi.fn(),
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
          },
        };
      }
      return mockElements[elId];
    };

    document.querySelector.mockImplementation(mockEl);
    document.getElementById.mockImplementation(mockEl);
    document.createElement.mockImplementation(() => ({
      className: '',
      innerHTML: '',
      appendChild: vi.fn(),
      addEventListener: vi.fn(),
    }));

    settingsManager = {
      get: vi.fn().mockReturnValue({}),
      set: vi.fn(),
      save: vi.fn(),
    };

    notificationManager = {
      success: vi.fn(),
    };

    integrationsSettings = new IntegrationsSettings(settingsManager, notificationManager);
  });

  it('should initialize with default values', () => {
    integrationsSettings.init();
    expect(id).toHaveBeenCalled();
  });
});
