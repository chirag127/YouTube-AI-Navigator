// Mocks
vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
  ss: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  now: vi.fn(),
  keys: vi.fn(),
  jp: vi.fn(),
  js: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
  isa: vi.fn(),
}));

import { SettingsManager } from '../../../extension/options/modules/settings-manager.js';

describe('SettingsManager', () => {
  let mockSg, mockSs, mockNow, mockKeys, mockJp, mockJs, mockIsa, manager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSg = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').sg);
    mockSs = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').ss);
    mockNow = vi.mocked(require('../../../extension/utils/shortcuts/core.js').now);
    mockKeys = vi.mocked(require('../../../extension/utils/shortcuts/core.js').keys);
    mockJp = vi.mocked(require('../../../extension/utils/shortcuts/core.js').jp);
    mockJs = vi.mocked(require('../../../extension/utils/shortcuts/core.js').js);
    mockIsa = vi.mocked(require('../../../extension/utils/shortcuts/array.js').isa);
    mockNow.mockReturnValue(1234567890);
    mockKeys.mockReturnValue(['key']);
    mockJp.mockImplementation(JSON.parse);
    mockJs.mockImplementation(JSON.stringify);
    mockIsa.mockReturnValue(false);
    manager = new SettingsManager();
  });

  it('should load settings', async () => {
    mockSg.mockResolvedValue({ config: { key: 'value' } });

    const result = await manager.load();

    expect(result).toEqual({ key: 'value' });
  });

  it('should load defaults if no config', async () => {
    mockSg.mockResolvedValue({});
    mockKeys.mockReturnValue([]);

    const result = await manager.load();

    expect(result).toHaveProperty('cache');
  });

  it('should save settings', async () => {
    manager.settings = { test: 'data' };
    mockSs.mockResolvedValue();

    const result = await manager.save();

    expect(result).toBe(true);
    expect(mockSs).toHaveBeenCalledWith({
      config: { test: 'data', _meta: { lastUpdated: 1234567890 } },
    });
  });

  it('should get value by path', () => {
    manager.settings = { a: { b: 'value' } };

    const result = manager.get('a.b');

    expect(result).toBe('value');
  });

  it('should set value by path', () => {
    manager.settings = {};

    manager.set('a.b', 'value');

    expect(manager.settings.a.b).toBe('value');
  });

  it('should update and save', async () => {
    manager.settings = {};
    mockSs.mockResolvedValue();

    await manager.update('path', 'value');

    expect(manager.settings.path).toBe('value');
    expect(mockSs).toHaveBeenCalled();
  });

  it('should reset to defaults', async () => {
    mockSs.mockResolvedValue();

    await manager.reset();

    expect(manager.settings).toHaveProperty('cache');
    expect(mockSs).toHaveBeenCalled();
  });

  it('should subscribe and notify', () => {
    const cb = vi.fn();
    manager.subscribe(cb);
    manager.settings = { test: true };

    manager.notify();

    expect(cb).toHaveBeenCalledWith({ test: true });
  });

  it('should export settings', () => {
    manager.settings = { test: 'data' };

    manager.export();

    expect(mockJs).toHaveBeenCalledWith({ test: 'data' }, null, 2);
  });

  it('should import settings', async () => {
    const json = '{"test": "data"}';
    mockSs.mockResolvedValue();

    const result = await manager.import(json);

    expect(result).toBe(true);
    expect(manager.settings).toEqual({ test: 'data' });
  });
});
