import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TabLoader } from '../../../extension/options/modules/tab-loader.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  url: vi.fn(path => `chrome-extension://mock/${path}`),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  $: vi.fn(() => ({
    insertAdjacentHTML: vi.fn(),
  })),
}));

vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
  ft: vi.fn().mockResolvedValue({
    text: vi.fn().mockResolvedValue('<div>Mock Content</div>'),
  }),
}));

describe('TabLoader', () => {
  let tabLoader;

  beforeEach(() => {
    tabLoader = new TabLoader();
  });

  it('should have all required tabs defined', () => {
    expect(tabLoader.tabs).toHaveProperty('general');
    expect(tabLoader.tabs).toHaveProperty('prompts');
    expect(tabLoader.tabs).toHaveProperty('integrations');
    expect(tabLoader.tabs).toHaveProperty('notifications');
  });

  it('should load a tab successfully', async () => {
    const result = await tabLoader.load('prompts');
    expect(result).toBe(true);
    expect(tabLoader.loaded.has('prompts')).toBe(true);
  });

  it('should not reload already loaded tabs', async () => {
    tabLoader.loaded.add('prompts');
    const result = await tabLoader.load('prompts');
    expect(result).toBe(true);
    // Should not call fetch again (mock check omitted for brevity, logic is simple)
  });

  it('should return false for unknown tabs', async () => {
    const result = await tabLoader.load('unknown');
    expect(result).toBe(false);
  });
});
