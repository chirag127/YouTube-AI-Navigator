// Mocks
vi.mock('../../../extension/background/services.js', () => ({
  initializeServices: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock('../../../extension/background/utils/api-key.js', () => ({
  getApiKey: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { handleAnalyzeComments } from '../../../extension/background/handlers/comments.js';

describe('handleAnalyzeComments', () => {
  let mockInitializeServices, mockGetServices, mockGetApiKey, mockE, mockGemini, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInitializeServices = vi.mocked(
      require('../../../extension/background/services.js').initializeServices
    );
    mockGetServices = vi.mocked(require('../../../extension/background/services.js').getServices);
    mockGetApiKey = vi.mocked(require('../../../extension/background/utils/api-key.js').getApiKey);
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockGemini = { analyzeCommentSentiment: vi.fn() };
    mockGetServices.mockReturnValue({ gemini: mockGemini });
    mockRsp = vi.fn();
  });

  it('should analyze comments successfully', async () => {
    const req = { comments: ['good', 'bad'] };
    mockGetApiKey.mockResolvedValue('key');
    mockInitializeServices.mockResolvedValue();
    mockGemini.analyzeCommentSentiment.mockResolvedValue({ positive: 1, negative: 1 });

    await handleAnalyzeComments(req, mockRsp);

    expect(mockGemini.analyzeCommentSentiment).toHaveBeenCalledWith(['good', 'bad']);
    expect(mockRsp).toHaveBeenCalledWith({ success: true, analysis: { positive: 1, negative: 1 } });
  });

  it('should handle no apiKey', async () => {
    const req = { comments: [] };
    mockGetApiKey.mockResolvedValue(null);

    await handleAnalyzeComments(req, mockRsp);

    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'API Key not configured' });
  });

  it('should handle error', async () => {
    const req = { comments: [] };
    mockGetApiKey.mockResolvedValue('key');
    mockInitializeServices.mockResolvedValue();
    mockGemini.analyzeCommentSentiment.mockRejectedValue(new Error('Analysis failed'));

    await handleAnalyzeComments(req, mockRsp);

    expect(mockE).toHaveBeenCalledWith('Err:AC', expect.any(Error));
    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'Analysis failed' });
  });
});
