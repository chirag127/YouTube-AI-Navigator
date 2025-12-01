import { UIAppearance } from '../../../extension/options/modules/ui-appearance.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  on: vi.fn(),
  id: vi.fn(),
}));



describe('UIAppearance', () => {
  let settingsManager;
  let autoSave;
  let uiAppearance;
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

    uiAppearance = new UIAppearance(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    uiAppearance.init();
    expect(id).toHaveBeenCalled();
  });
});
