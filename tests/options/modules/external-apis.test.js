import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalAPIs } from '../../../extension/options/modules/external-apis.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));

import { qs } from '../../../extension/utils/shortcuts/dom.js';

describe('ExternalAPIs', () => {
  let settingsManager;
  let autoSave;
  let externalAPIs;
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

    externalAPIs = new ExternalAPIs(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    externalAPIs.init();
    expect(autoSave.attachToAll).toHaveBeenCalled();
  });
});
