import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranscriptSettings } from '../../../extension/options/modules/transcript-settings.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));

import { qs } from '../../../extension/utils/shortcuts/dom.js';

describe('TranscriptSettings', () => {
  let settingsManager;
  let autoSave;
  let transcriptSettings;
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

    transcriptSettings = new TranscriptSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    transcriptSettings.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
