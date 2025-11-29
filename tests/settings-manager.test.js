import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsManager } from '../extension/options/modules/settings-manager.js';

// Mock the storage shortcuts
vi.mock('../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
  ss: vi.fn(),
  slg: vi.fn(),
}));

import { sg, ss } from '../extension/utils/shortcuts/storage.js';

describe('SettingsManager', () => {
  let settingsManager;

  beforeEach(() => {
    vi.clearAllMocks();
    settingsManager = new SettingsManager();
  });

  it('should initialize with empty settings', () => {
    expect(settingsManager.settings).toEqual({});
  });

  it('should load settings from storage', async () => {
    const mockSettings = { config: { ai: { apiKey: 'test-key' } } };
    sg.mockResolvedValue(mockSettings);

    await settingsManager.load();

    expect(sg).toHaveBeenCalledWith('config');
    expect(settingsManager.get('ai.apiKey')).toBe('test-key');
  });

  it('should use defaults if storage is empty', async () => {
    sg.mockResolvedValue({});

    await settingsManager.load();

    expect(settingsManager.get('ai.model')).toBeDefined();
    expect(settingsManager.get('ui.theme')).toBe('dark');
  });

  it('should save settings to storage', async () => {
    sg.mockResolvedValue({});
    await settingsManager.load(); // Load defaults first

    settingsManager.set('ai.apiKey', 'new-key');
    await settingsManager.save();

    expect(ss).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        ai: expect.objectContaining({ apiKey: 'new-key' })
      })
    }));
  });

  it('should update settings and save', async () => {
    sg.mockResolvedValue({});
    await settingsManager.load();

    await settingsManager.update('ui.theme', 'light');

    expect(settingsManager.get('ui.theme')).toBe('light');
    expect(ss).toHaveBeenCalled();
  });

  it('should reset settings to defaults', async () => {
    sg.mockResolvedValue({});
    await settingsManager.load();
    settingsManager.set('ui.theme', 'light');

    await settingsManager.reset();

    expect(settingsManager.get('ui.theme')).toBe('dark');
    expect(ss).toHaveBeenCalled();
  });

  it('should notify listeners on change', async () => {
    const listener = vi.fn();
    settingsManager.subscribe(listener);

    settingsManager.notify();

    expect(listener).toHaveBeenCalledWith(settingsManager.settings);
  });
});
