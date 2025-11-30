// Mocks
vi.mock('../../../extension/background/services.js', () => ({
  initializeServices: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock('../../../extension/background/utils/api-key.js', () => ({
  getApiKey: vi.fn(),
}));

import { handleClassifySegments } from '../../../extension/background/handlers/segments.js';

describe('handleClassifySegments', () => {
  let mockInitializeServices, mockGetServices, mockGetApiKey, mockSegmentClassification, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInitializeServices = vi.mocked(
      require('../../../extension/background/services.js').initializeServices
    );
    mockGetServices = vi.mocked(require('../../../extension/background/services.js').getServices);
    mockGetApiKey = vi.mocked(require('../../../extension/background/utils/api-key.js').getApiKey);
    mockSegmentClassification = { classifyTranscript: vi.fn() };
    mockGetServices.mockReturnValue({ segmentClassification: mockSegmentClassification });
    mockRsp = vi.fn();
  });

  it('should classify segments successfully', async () => {
    const req = { transcript: [{ text: 'hello' }], settings: {} };
    mockGetApiKey.mockResolvedValue('key');
    mockInitializeServices.mockResolvedValue();
    mockSegmentClassification.classifyTranscript.mockResolvedValue({ segments: [] });

    await handleClassifySegments(req, mockRsp);

    expect(mockSegmentClassification.classifyTranscript).toHaveBeenCalledWith({
      transcript: [{ text: 'hello' }],
      metadata: {},
    });
    expect(mockRsp).toHaveBeenCalledWith({ success: true, data: { segments: [] } });
  });

  it('should use apiKey from settings', async () => {
    const req = { transcript: [], settings: { apiKey: 'settingsKey' } };
    mockInitializeServices.mockResolvedValue();
    mockSegmentClassification.classifyTranscript.mockResolvedValue({ segments: [] });

    await handleClassifySegments(req, mockRsp);

    expect(mockGetApiKey).not.toHaveBeenCalled();
    expect(mockInitializeServices).toHaveBeenCalledWith('settingsKey');
  });

  it('should handle no apiKey', async () => {
    const req = { transcript: [], settings: {} };
    mockGetApiKey.mockResolvedValue(null);

    await handleClassifySegments(req, mockRsp);

    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'API Key not configured' });
  });
});
