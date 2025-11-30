import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerformanceSettings } from '../../../extension/options/modules/performance.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));

import { qs } from '../../../extension/utils/shortcuts/dom.js';

describe('PerformanceSettings', () => {
  let settingsManager;
  let autoSave;
  let performanceSettings;
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

    performanceSettings = new PerformanceSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    performanceSettings.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
