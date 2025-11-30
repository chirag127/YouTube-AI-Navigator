import { handleAnalyzeVideo } from '../../../extension/background/handlers/analyze-video.js';

vi.mock('../../../extension/background/services.js', () => ({
  initializeServices: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock('../../../extension/background/utils/api-key.js', () => ({
  getApiKey: vi.fn(),
}));

vi.mock('../../../extension/api/genius-lyrics.js', () => ({
  geniusLyricsAPI: {
    getLyrics: vi.fn(),
  },
}));

vi.mock('../../../extension/api/sponsorblock.js', () => ({
  sponsorBlockAPI: {
    fetchSegments: vi.fn(),
  },
}));

vi.mock('../../../extension/services/context-manager.js', () => ({
  ContextManager: vi.fn().mockImplementation(() => ({
    fetchContext: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
  ss: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/global.js', () => ({
  si: vi.fn(),
  ci: vi.fn(),
  to: vi.fn((cb, ms) => new Promise(resolve => setTimeout(resolve, ms))),
}));

vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  r: {
    getPlatformInfo: vi.fn(),
  },
}));

vi.mock('../../../extension/utils/shortcuts/async.js', () => ({
  np: vi.fn(fn => fn()),
  pc: vi.fn(promises => Promise.race(promises)),
}));

import { initializeServices, getServices } from '../../../extension/background/services.js';
import { getApiKey } from '../../../extension/background/utils/api-key.js';
import { geniusLyricsAPI } from '../../../extension/api/genius-lyrics.js';
import { sponsorBlockAPI } from '../../../extension/api/sponsorblock.js';
import { sg } from '../../../extension/utils/shortcuts/storage.js';

describe('handleAnalyzeVideo', () => {
  let mockCallback;
  let mockGemini;
  let mockSegmentClassification;
  let mockStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallback = vi.fn();

    mockGemini = {
      generateComprehensiveAnalysis: vi.fn().mockResolvedValue({
        summary: 'Test summary',
        faq: 'Test FAQ',
        insights: 'Test insights',
        timestamps: [],
      }),
    };

    mockSegmentClassification = {
      classifyTranscript: vi.fn().mockResolvedValue({
        segments: [],
        fullVideoLabel: null,
      }),
    };

    mockStorage = {
      getVideoData: vi.fn().mockResolvedValue(null),
      saveVideoData: vi.fn().mockResolvedValue(undefined),
    };

    getApiKey.mockResolvedValue('test-api-key');
    initializeServices.mockResolvedValue(undefined);
    getServices.mockReturnValue({
      gemini: mockGemini,
      segmentClassification: mockSegmentClassification,
      storage: mockStorage,
    });

    sg.mockResolvedValue({ config: {} });
    geniusLyricsAPI.getLyrics.mockResolvedValue(null);
    sponsorBlockAPI.fetchSegments.mockResolvedValue([]);
  });

  it('should return error if no API key', async () => {
    getApiKey.mockResolvedValue(null);

    await handleAnalyzeVideo(
      {
        transcript: [],
        metadata: { title: 'Test' },
      },
      mockCallback
    );

    expect(mockCallback).toHaveBeenCalledWith({
      success: false,
      error: 'API Key NA',
    });
  });

  it('should return cached data when available', async () => {
    const cached = {
      summary: 'Cached summary',
      segments: [{ category: 'content' }],
      faq: 'FAQ',
      insights: 'Insights',
      timestamps: [],
    };
    mockStorage.getVideoData.mockResolvedValue(cached);

    await handleAnalyzeVideo(
      {
        transcript: [],
        metadata: { videoId: 'vid123', title: 'Test' },
        useCache: true,
      },
      mockCallback
    );

    expect(mockCallback).toHaveBeenCalledWith({
      success: true,
      fromCache: true,
      data: expect.objectContaining({
        summary: 'Cached summary',
        segments: [{ category: 'content' }],
      }),
    });
  });

  it('should analyze video with transcript', async () => {
    await handleAnalyzeVideo(
      {
        transcript: [{ text: 'Hello world', start: 0 }],
        metadata: { videoId: 'vid123', title: 'Test Video', author: 'Test Channel' },
      },
      mockCallback
    );

    expect(mockGemini.generateComprehensiveAnalysis).toHaveBeenCalled();
    expect(mockSegmentClassification.classifyTranscript).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith({
      success: true,
      fromCache: false,
      data: expect.objectContaining({
        summary: 'Test summary',
        faq: 'Test FAQ',
        insights: 'Test insights',
      }),
    });
  });

  it('should fetch lyrics for music videos', async () => {
    geniusLyricsAPI.getLyrics.mockResolvedValue({ lyrics: 'Song lyrics', source: 'Genius' });

    await handleAnalyzeVideo(
      {
        transcript: [],
        metadata: { category: 'Music', title: 'Song Title', author: 'Artist' },
      },
      mockCallback
    );

    expect(geniusLyricsAPI.getLyrics).toHaveBeenCalledWith('Song Title', 'Artist');
  });

  it('should fetch sponsorblock segments', async () => {
    sponsorBlockAPI.fetchSegments.mockResolvedValue([{ category: 'sponsor', start: 10, end: 20 }]);

    await handleAnalyzeVideo(
      {
        transcript: [{ text: 'test', start: 0 }],
        metadata: { videoId: 'vid123', title: 'Test' },
      },
      mockCallback
    );

    expect(sponsorBlockAPI.fetchSegments).toHaveBeenCalledWith('vid123');
  });

  it('should handle analysis errors', async () => {
    mockGemini.generateComprehensiveAnalysis.mockRejectedValue(new Error('Analysis failed'));

    await handleAnalyzeVideo(
      {
        transcript: [{ text: 'test' }],
        metadata: { title: 'Test' },
      },
      mockCallback
    );

    expect(mockCallback).toHaveBeenCalledWith({
      success: false,
      error: 'Analysis failed',
    });
  });
});
