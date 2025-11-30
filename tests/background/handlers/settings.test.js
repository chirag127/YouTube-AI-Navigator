// Mocks
vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { handleGetSettings } from '../../../extension/background/handlers/settings.js';

describe('handleGetSettings', () => {
  let mockSg, mockE, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSg = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').sg);
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockRsp = vi.fn();
  });

  it('should get settings successfully', async () => {
    mockSg.mockResolvedValue({ config: { key: 'value' } });

    await handleGetSettings(mockRsp);

    expect(mockSg).toHaveBeenCalledWith('config');
    expect(mockRsp).toHaveBeenCalledWith({ success: true, data: { key: 'value' } });
  });

  it('should return empty config if no config', async () => {
    mockSg.mockResolvedValue({});

    await handleGetSettings(mockRsp);

    expect(mockRsp).toHaveBeenCalledWith({ success: true, data: {} });
  });

  it('should handle error', async () => {
    mockSg.mockRejectedValue(new Error('Storage error'));

    await handleGetSettings(mockRsp);

    expect(mockE).toHaveBeenCalledWith('GetSettings:', expect.any(Error));
    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'Storage error' });
  });
});
