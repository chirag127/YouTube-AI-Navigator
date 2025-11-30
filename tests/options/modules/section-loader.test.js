// Mocks
vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  url: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  $: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/async.js', () => ({
  pa: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  ok: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
  ft: vi.fn(),
}));

import { SectionLoader } from '../../../extension/options/modules/section-loader.js';

describe('SectionLoader', () => {
  let mockUrl, mock$, mockE, mockPa, mockOk, mockFt;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUrl = vi.mocked(require('../../../extension/utils/shortcuts/runtime.js').url);
    mock$ = vi.mocked(require('../../../extension/utils/shortcuts/dom.js').$);
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockPa = vi.mocked(require('../../../extension/utils/shortcuts/async.js').pa);
    mockOk = vi.mocked(require('../../../extension/utils/shortcuts/core.js').ok);
    mockFt = vi.mocked(require('../../../extension/utils/shortcuts/network.js').ft);
    mockUrl.mockImplementation(p => `chrome-extension://id/${p}`);
    mock$.mockReturnValue({ insertAdjacentHTML: vi.fn() });
  });

  it('should load section successfully', async () => {
    const loader = new SectionLoader();
    mockFt.mockResolvedValue({ text: vi.fn().mockResolvedValue('<div>content</div>') });

    const result = await loader.load('general');

    expect(result).toBe(true);
    expect(mockFt).toHaveBeenCalledWith('chrome-extension://id/options/sections/general.html');
    expect(loader.loaded.has('general')).toBe(true);
  });

  it('should return true if already loaded', async () => {
    const loader = new SectionLoader();
    loader.loaded.add('general');

    const result = await loader.load('general');

    expect(result).toBe(true);
    expect(mockFt).not.toHaveBeenCalled();
  });

  it('should return false for invalid section', async () => {
    const loader = new SectionLoader();

    const result = await loader.load('invalid');

    expect(result).toBe(false);
  });

  it('should handle load error', async () => {
    const loader = new SectionLoader();
    mockFt.mockRejectedValue(new Error('Network error'));

    const result = await loader.load('general');

    expect(result).toBe(false);
    expect(mockE).toHaveBeenCalledWith(
      '[SectionLoader] Failed to load general:',
      expect.any(Error)
    );
  });

  it('should load all sections', async () => {
    const loader = new SectionLoader();
    mockOk.mockReturnValue(['general', 'cache']);
    mockPa.mockResolvedValue();

    await loader.loadAll();

    expect(mockPa).toHaveBeenCalled();
  });
});
