import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetadataSettings } from '../../../extension/options/modules/metadata-settings.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));

import { qs } from '../../../extension/utils/shortcuts/dom.js';

describe('MetadataSettings', () => {
  let settingsManager;
  let autoSave;
  let metadataSettings;
  let mockElements = {};

  beforeEach(() => {
    mockElements = {};
    qs.mockImplementation(selector => {
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

    metadataSettings = new MetadataSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    metadataSettings.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
