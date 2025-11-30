// Mocks
vi.mock('../../../extension/background/services.js', () => ({
  initializeServices: vi.fn(),
}));

vi.mock('../../../extension/background/utils/api-key.js', () => ({
  getApiKey: vi.fn(),
}));

import { handleSaveComments } from '../../../extension/background/handlers/comments-storage.js';

describe('handleSaveComments', () => {
  let mockInitializeServices, mockGetApiKey, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInitializeServices = vi.mocked(
      require('../../../extension/background/services.js').initializeServices
    );
    mockGetApiKey = vi.mocked(require('../../../extension/background/utils/api-key.js').getApiKey);
    mockRsp = vi.fn();
  });

  it('should initialize services if apiKey exists', async () => {
    const req = {};
    mockGetApiKey.mockResolvedValue('key');
    mockInitializeServices.mockResolvedValue();

    await handleSaveComments(req, mockRsp);

    expect(mockGetApiKey).toHaveBeenCalled();
    expect(mockInitializeServices).toHaveBeenCalledWith('key');
    expect(mockRsp).toHaveBeenCalledWith({ success: true });
  });

  it('should not initialize if no apiKey', async () => {
    const req = {};
    mockGetApiKey.mockResolvedValue(null);

    await handleSaveComments(req, mockRsp);

    expect(mockInitializeServices).not.toHaveBeenCalled();
    expect(mockRsp).toHaveBeenCalledWith({ success: true });
  });
});
