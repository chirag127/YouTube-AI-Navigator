import { AutoSave } from '../../extension/options/modules/auto-save.js';

// Mock dependencies
const mocks = vi.hoisted(() => ({
  qs: vi.fn(),
  on: vi.fn(),
  e: vi.fn(),
  to: vi.fn((cb, d) => setTimeout(cb, d)),
  clt: vi.fn(t => clearTimeout(t)),
  oe: vi.fn(obj => Object.entries(obj)),
}));

vi.mock('../../extension/utils/shortcuts/log.js', () => ({
  e: mocks.e,
}));

vi.mock('../../extension/utils/shortcuts/global.js', () => ({
  to: mocks.to,
  clt: mocks.clt,
}));

vi.mock('../../extension/utils/shortcuts/core.js', () => ({
  oe: mocks.oe,
}));

vi.mock('../../extension/utils/shortcuts/dom.js', () => ({
  qs: mocks.qs,
  on: mocks.on,
}));

describe('AutoSave', () => {
  let settingsManager;
  let notificationManager;
  let autoSave;

  beforeEach(() => {
    vi.clearAllMocks();
    settingsManager = {
      update: vi.fn().mockResolvedValue(),
    };
    notificationManager = {
      saving: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
    };
    autoSave = new AutoSave(settingsManager, 100, notificationManager);
  });

  it('should use the selector property if provided', () => {
    const config = {
      testSetting: {
        path: 'test.setting',
        selector: '#custom-selector',
      },
    };

    const mockElement = { type: 'text', value: 'value' };
    mocks.document.querySelector.mockReturnValue(mockElement);

    autoSave.attachToAll(config);

    expect(mocks.qs).toHaveBeenCalledWith('#custom-selector');
    expect(mocks.on).toHaveBeenCalledWith(mockElement, 'change', expect.any(Function));
    expect(mocks.on).toHaveBeenCalledWith(mockElement, 'input', expect.any(Function));
  });

  it('should fallback to ID if selector is not provided', () => {
    const config = {
      defaultSetting: {
        path: 'default.setting',
      },
    };

    const mockElement = { type: 'text', value: 'value' };
    mocks.document.querySelector.mockReturnValue(mockElement);

    autoSave.attachToAll(config);

    expect(mocks.qs).toHaveBeenCalledWith('#defaultSetting');
  });
});
