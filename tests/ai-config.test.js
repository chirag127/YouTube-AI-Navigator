import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIConfig } from '../extension/options/modules/ai-config.js';

vi.mock('../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  on: vi.fn(),
  ap: vi.fn(),
  tc: vi.fn(),
  ih: vi.fn(),
  rc: vi.fn(),
  vl: vi.fn(),
  ce: vi.fn(() => ({ value: '', appendChild: vi.fn() })),
}));

vi.mock('../extension/utils/shortcuts/core.js', () => ({
  js: vi.fn(v => JSON.stringify(v)),
  isS: vi.fn(v => typeof v === 'string'),
}));

vi.mock('../extension/utils/shortcuts/global.js', () => ({
  jp: vi.fn(v => JSON.parse(v)),
  pf: vi.fn(v => parseFloat(v)),
}));

vi.mock('../extension/utils/shortcuts/string.js', () => ({
  inc: vi.fn((arr, val) => arr.includes(val)),
  rp: vi.fn((str, search, replace) => str.replace(search, replace)),
  tr: vi.fn(str => str.trim()),
  sw: vi.fn((str, prefix) => str.startsWith(prefix)),
}));

vi.mock('../extension/utils/shortcuts/array.js', () => ({
  fe: vi.fn((arr, fn) => arr.forEach(fn)),
}));

vi.mock('../extension/utils/shortcuts/network.js', () => ({
  ft: vi.fn(),
}));

vi.mock('../extension/api/gemini.js', () => ({
  ModelManager: class MockModelManager {
    constructor() {
      this.fetch = vi.fn().mockResolvedValue(['gemini-2.0-flash-exp', 'gemini-1.5-pro']);
    }
  },
}));

import { qs, ih, vl } from '../extension/utils/shortcuts/dom.js';
import { ft } from '../extension/utils/shortcuts/network.js';

describe('AIConfig', () => {
  let aiConfig;
  let mockSettingsManager;
  let mockAutoSave;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsManager = {
      get: vi.fn(() => ({ ai: { apiKey: '', model: '', customPrompt: '' } })),
    };
    mockAutoSave = {
      save: vi.fn(),
      attachToInput: vi.fn(),
      notifications: { success: vi.fn(), error: vi.fn() },
    };
    aiConfig = new AIConfig(mockSettingsManager, mockAutoSave);
  });

  it('should initialize with empty config', () => {
    expect(aiConfig.s).toBe(mockSettingsManager);
    expect(aiConfig.a).toBe(mockAutoSave);
    expect(aiConfig.mm).toBeNull();
  });

  it('should test connection successfully', async () => {
    mockSettingsManager.get.mockReturnValue({
      ai: { GAK: 'test-key', model: 'gemini-2.0-flash-exp' },
    });
    const mockBtn = { disabled: false };
    const mockStatus = { className: '' };
    qs.mockImplementation(selector => {
      if (selector === '#testConnection') return mockBtn;
      if (selector === '#apiStatus') return mockStatus;
      if (selector === '#modelSelect') return { value: 'gemini-2.0-flash-exp' };
      return null;
    });
    vl.mockReturnValue('gemini-2.0-flash-exp');
    ft.mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('{}') });

    await aiConfig.test();

    expect(ft).toHaveBeenCalled();
    expect(mockAutoSave.notifications.success).toHaveBeenCalledWith('API verified');
  });

  it('should handle connection test failure', async () => {
    mockSettingsManager.get.mockReturnValue({
      ai: { apiKey: 'invalid-key', model: 'gemini-2.0-flash-exp' },
    });
    const mockBtn = { disabled: false };
    const mockStatus = { className: '' };
    qs.mockImplementation(selector => {
      if (selector === '#testConnection') return mockBtn;
      if (selector === '#apiStatus') return mockStatus;
      if (selector === '#modelSelect') return { value: 'gemini-2.0-flash-exp' };
      return null;
    });
    vl.mockReturnValue('gemini-2.0-flash-exp');
    ft.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
      text: vi.fn().mockResolvedValue(JSON.stringify({ error: { message: 'Invalid API key' } })),
    });

    await aiConfig.test();

    expect(mockAutoSave.notifications.error).toHaveBeenCalled();
  });
});
