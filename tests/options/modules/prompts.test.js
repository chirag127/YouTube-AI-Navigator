import { PromptsSettings } from '../../../extension/options/modules/prompts.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  id: vi.fn(),
}));



describe('PromptsSettings', () => {
  let settingsManager;
  let autoSave;
  let promptsSettings;
  let mockElements = {};

  beforeEach(() => {
    mockElements = {};
    document.getElementById.mockImplementation(elementId => {
      if (!mockElements[elementId]) {
        mockElements[elementId] = {
          value: '',
          checked: false,
          addEventListener: vi.fn(),
        };
      }
      return mockElements[elementId];
    });

    settingsManager = {
      get: vi.fn().mockReturnValue({}),
      set: vi.fn(),
      save: vi.fn().mockResolvedValue(true),
    };

    autoSave = {
      trigger: vi.fn(),
    };

    promptsSettings = new PromptsSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', async () => {
    await promptsSettings.init();
    expect(id).toHaveBeenCalledWith('prompts-segments-role');
  });

  it('should save settings correctly', async () => {
    // Setup mock values
    document.getElementById('prompts-segments-sponsor-range').value = '30,90';
    document.getElementById('prompts-segments-intro-range').value = '5,15';
    document.getElementById('prompts-segments-outro-range').value = '10,30';
    document.getElementById('prompts-segments-min-short').value = '3';
    document.getElementById('prompts-segments-min-long').value = '8';
    document.getElementById('prompts-segments-threshold').value = '600';
    document.getElementById('prompts-comprehensive-max-resources').value = '10';
    document.getElementById('prompts-comprehensive-max-takeaways').value = '5';
    document.getElementById('prompts-comments-likes').value = '10';
    document.getElementById('prompts-comments-themes').value = '7';
    document.getElementById('prompts-comments-questions').value = '5';

    await promptsSettings.save();
    expect(settingsManager.set).toHaveBeenCalled();
    expect(settingsManager.save).toHaveBeenCalled();
  });
});
