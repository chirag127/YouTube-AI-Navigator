// Mocks
vi.mock('../../../extension/services/storage/comprehensive-history.js', () => ({
  getHistory: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  slg: vi.fn(),
  sls: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  nw: vi.fn(),
}));

vi.mock('../../../extension/background/handlers/video-info.js', () => ({
  handleGetVideoInfo: vi.fn(),
}));

vi.mock('../../../extension/background/handlers/fetch-transcript.js', () => ({
  handleFetchTranscript: vi.fn(),
}));

vi.mock('../../../extension/background/handlers/comments.js', () => ({
  handleAnalyzeComments: vi.fn(),
}));

import {
  handleSaveHistory,
  handleGetVideoData,
} from '../../../extension/background/handlers/video-data.js';

describe('handleSaveHistory', () => {
  let mockGetHistory, mockHistory;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory = { save: vi.fn() };
    mockGetHistory = vi.mocked(
      require('../../../extension/services/storage/comprehensive-history.js').getHistory
    );
    mockGetHistory.mockReturnValue(mockHistory);
  });

  it('should save history', async () => {
    const req = { data: { videoId: 'vid1', summary: 'sum' } };
    mockHistory.save.mockResolvedValue();

    const result = await handleSaveHistory(req);

    expect(mockHistory.save).toHaveBeenCalledWith('vid1', { videoId: 'vid1', summary: 'sum' });
    expect(result).toEqual({ success: true });
  });
});

describe('handleGetVideoData', () => {
  let mockSlg,
    mockSls,
    mockE,
    mockNw,
    mockHandleGetVideoInfo,
    mockHandleFetchTranscript,
    mockHandleAnalyzeComments;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSlg = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').slg);
    mockSls = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').sls);
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockNw = vi.mocked(require('../../../extension/utils/shortcuts/core.js').nw);
    mockHandleGetVideoInfo = vi.mocked(
      require('../../../extension/background/handlers/video-info.js').handleGetVideoInfo
    );
    mockHandleFetchTranscript = vi.mocked(
      require('../../../extension/background/handlers/fetch-transcript.js').handleFetchTranscript
    );
    mockHandleAnalyzeComments = vi.mocked(
      require('../../../extension/background/handlers/comments.js').handleAnalyzeComments
    );
    mockNw.mockReturnValue(1000000000);
  });

  it('should return cached data', async () => {
    const req = { videoId: 'vid1', dataType: 'metadata' };
    mockSlg.mockResolvedValue({
      video_vid1_metadata: { version: 1, timestamp: 999999999, data: 'cached' },
    });

    const result = await handleGetVideoData(req);

    expect(result).toEqual({ success: true, data: 'cached', fromCache: true });
  });

  it('should fetch metadata', async () => {
    const req = { videoId: 'vid1', dataType: 'metadata' };
    mockSlg.mockResolvedValue({});
    mockHandleGetVideoInfo.mockResolvedValue({ success: true, metadata: 'meta' });
    mockSls.mockResolvedValue();

    const result = await handleGetVideoData(req);

    expect(mockHandleGetVideoInfo).toHaveBeenCalledWith({ videoId: 'vid1' });
    expect(result).toEqual({ success: true, data: 'meta', fromCache: false });
  });

  it('should fetch transcript', async () => {
    const req = { videoId: 'vid1', dataType: 'transcript', options: { lang: 'es' } };
    mockSlg.mockResolvedValue({});
    mockHandleFetchTranscript.mockResolvedValue({ success: true, segments: 'trans' });
    mockSls.mockResolvedValue();

    const result = await handleGetVideoData(req);

    expect(mockHandleFetchTranscript).toHaveBeenCalledWith({ videoId: 'vid1', lang: 'es' });
    expect(result).toEqual({ success: true, data: 'trans', fromCache: false });
  });

  it('should fetch comments', async () => {
    const req = { videoId: 'vid1', dataType: 'comments' };
    mockSlg.mockResolvedValue({});
    mockHandleAnalyzeComments.mockResolvedValue({ success: true, comments: 'coms' });
    mockSls.mockResolvedValue();

    const result = await handleGetVideoData(req);

    expect(mockHandleAnalyzeComments).toHaveBeenCalledWith({ videoId: 'vid1', limit: 20 });
    expect(result).toEqual({ success: true, data: 'coms', fromCache: false });
  });

  it('should handle invalid dataType', async () => {
    const req = { videoId: 'vid1', dataType: 'invalid' };

    const result = await handleGetVideoData(req);

    expect(result).toEqual({ success: false, error: 'Invalid data type' });
  });

  it('should handle fetch failure', async () => {
    const req = { videoId: 'vid1', dataType: 'metadata' };
    mockSlg.mockResolvedValue({});
    mockHandleGetVideoInfo.mockRejectedValue(new Error('Fetch error'));

    const result = await handleGetVideoData(req);

    expect(mockE).toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Fetch error' });
  });
});
