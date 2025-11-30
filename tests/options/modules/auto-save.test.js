// Mocks
vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/global.js', () => ({
  to: vi.fn(),
  clt: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  on: vi.fn(),
  qs: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  oe: vi.fn(),
}));

import { AutoSave } from '../../../extension/options/modules/auto-save.js';

describe('AutoSave', () => {
  let mockE, mockTo, mockClt, mockOn, mockQs, mockOe, mockSm, mockNotifier;

  beforeEach(() => {
    vi.clearAllMocks();
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockTo = vi.mocked(require('../../../extension/utils/shortcuts/global.js').to);
    mockClt = vi.mocked(require('../../../extension/utils/shortcuts/global.js').clt);
    mockOn = vi.mocked(require('../../../extension/utils/shortcuts/dom.js').on);
    mockQs = vi.mocked(require('../../../extension/utils/shortcuts/dom.js').qs);
    mockOe = vi.mocked(require('../../../extension/utils/shortcuts/core.js').oe);
    mockSm = { update: vi.fn() };
    mockNotifier = { saving: vi.fn(), success: vi.fn(), error: vi.fn() };
    mockTo.mockImplementation(fn => fn());
  });

  it('should save successfully', async () => {
    const autoSave = new AutoSave(mockSm, 500, mockNotifier);
    mockSm.update.mockResolvedValue();

    await autoSave.save('path', 'value');

    expect(mockClt).toHaveBeenCalled();
    expect(mockNotifier.saving).toHaveBeenCalledWith('Saving...');
    expect(mockSm.update).toHaveBeenCalledWith('path', 'value');
    expect(mockNotifier.success).toHaveBeenCalled();
    expect(mockE).toHaveBeenCalledWith('[AutoSave] Saved path');
  });

  it('should handle save error', async () => {
    const autoSave = new AutoSave(mockSm, 500, mockNotifier);
    mockSm.update.mockRejectedValue(new Error('Save failed'));

    await autoSave.save('path', 'value');

    expect(mockNotifier.error).toHaveBeenCalledWith('Failed to save: Save failed');
    expect(mockE).toHaveBeenCalledWith('[AutoSave] Failed to save path:', expect.any(Error));
  });

  it('should trigger callback', async () => {
    const autoSave = new AutoSave(mockSm);
    const cb = vi.fn().mockResolvedValue();

    await autoSave.trigger(cb);

    expect(mockClt).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });

  it('should attach to input', () => {
    const autoSave = new AutoSave(mockSm);
    const el = { type: 'text', value: 'test' };

    autoSave.attachToInput(el, 'path');

    expect(mockOn).toHaveBeenCalledTimes(2);
  });

  it('should attach to all', () => {
    const autoSave = new AutoSave(mockSm);
    const map = { id1: { selector: '#id1', path: 'p1' } };
    mockOe.mockReturnValue([['id1', map.id1]]);
    mockQs.mockReturnValue({});

    autoSave.attachToAll(map);

    expect(mockQs).toHaveBeenCalledWith('#id1');
  });
});
