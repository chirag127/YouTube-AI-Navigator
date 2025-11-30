vi.mock('../../../extension/content/core/state.js', () => ({
  state: { isAnalyzing: false, currentVideoId: '123', currentTranscript: [], analysisData: null },
}));

vi.mock('../../../extension/content/transcript/strategy-manager.js', () => ({
  extractTranscript: vi.fn(),
}));

vi.mock('../../../extension/content/metadata/extractor.js', () => ({
  metadataExtractor: { extract: vi.fn() },
}));

vi.mock('../../../extension/content/handlers/comments.js', () => ({
  getComments: vi.fn(),
}));

vi.mock('../../../extension/content/ui/components/loading.js', () => ({
  showLoading: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('../../../extension/content/ui/tabs.js', () => ({
  switchTab: vi.fn(),
}));

vi.mock('../../../extension/content/segments/markers.js', () => ({
  injectSegmentMarkers: vi.fn(),
}));

vi.mock('../../../extension/content/segments/autoskip.js', () => ({
  setupAutoSkip: vi.fn(),
}));

vi.mock('../../../extension/content/segments/timeline.js', () => ({
  renderTimeline: vi.fn(),
}));

vi.mock('../../../extension/content/features/analysis/service.js', () => ({
  analyzeVideo: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  id: vi.fn(),
  $: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  msg: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  E: vi.fn(),
}));

import { startAnalysis } from '../../../extension/content/features/analysis/flow.js';

describe('startAnalysis', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = vi.mocked(await import('../../../extension/content/core/state.js')).state;
    state.isAnalyzing = false;
    state.currentVideoId = '123';
  });

  it('should analyze successfully', async () => {
    const state = vi.mocked(await import('../../../extension/content/core/state.js')).state;
    const msg = vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js')).msg;
    msg.mockResolvedValueOnce({
      externalApis: { deArrow: { enabled: true, usePrivateAPI: true } },
    });
    const metadataExtractor = vi.mocked(
      await import('../../../extension/content/metadata/extractor.js')
    ).metadataExtractor;
    metadataExtractor.extract.mockResolvedValue('metadata');
    const extractTranscript = vi.mocked(
      await import('../../../extension/content/transcript/strategy-manager.js')
    ).extractTranscript;
    extractTranscript.mockResolvedValue({ success: true, data: 'transcript' });
    const getComments = vi.mocked(
      await import('../../../extension/content/handlers/comments.js')
    ).getComments;
    getComments.mockResolvedValue('comments');
    const analyzeVideo = vi.mocked(
      await import('../../../extension/content/features/analysis/service.js')
    ).analyzeVideo;
    analyzeVideo.mockResolvedValue({
      success: true,
      data: { segments: 'segments', summary: 'summary' },
    });
    const $ = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).$;
    $.mockReturnValue({ duration: 100 });
    msg.mockResolvedValueOnce();

    await startAnalysis();

    expect(state.isAnalyzing).toBe(false);
    expect(state.analysisData).toEqual({ segments: 'segments', summary: 'summary' });
  });

  it('should handle settings timeout', async () => {
    const msg = vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js')).msg;
    msg.mockRejectedValueOnce(new Error('timeout'));
    const metadataExtractor = vi.mocked(
      await import('../../../extension/content/metadata/extractor.js')
    ).metadataExtractor;
    metadataExtractor.extract.mockResolvedValue('metadata');
    const extractTranscript = vi.mocked(
      await import('../../../extension/content/transcript/strategy-manager.js')
    ).extractTranscript;
    extractTranscript.mockResolvedValue({ success: true, data: 'transcript' });
    const getComments = vi.mocked(
      await import('../../../extension/content/handlers/comments.js')
    ).getComments;
    getComments.mockResolvedValue('comments');
    const analyzeVideo = vi.mocked(
      await import('../../../extension/content/features/analysis/service.js')
    ).analyzeVideo;
    analyzeVideo.mockResolvedValue({ success: true, data: {} });

    await startAnalysis();

    expect(msg).toHaveBeenCalledWith({ action: 'SAVE_HISTORY', data: expect.any(Object) });
  });

  it('should handle analysis failure', async () => {
    const msg = vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js')).msg;
    msg.mockResolvedValueOnce({});
    const metadataExtractor = vi.mocked(
      await import('../../../extension/content/metadata/extractor.js')
    ).metadataExtractor;
    metadataExtractor.extract.mockResolvedValue('metadata');
    const extractTranscript = vi.mocked(
      await import('../../../extension/content/transcript/strategy-manager.js')
    ).extractTranscript;
    extractTranscript.mockResolvedValue({ success: true, data: 'transcript' });
    const getComments = vi.mocked(
      await import('../../../extension/content/handlers/comments.js')
    ).getComments;
    getComments.mockResolvedValue('comments');
    const analyzeVideo = vi.mocked(
      await import('../../../extension/content/features/analysis/service.js')
    ).analyzeVideo;
    analyzeVideo.mockResolvedValue({ success: false, error: 'analysis error' });
    const showError = vi.mocked(
      await import('../../../extension/content/ui/components/loading.js')
    ).showError;
    const e = vi.mocked(await import('../../../extension/utils/shortcuts/log.js')).e;

    await startAnalysis();

    expect(showError).toHaveBeenCalled();
    expect(e).toHaveBeenCalledWith('Err:startAnalysis', expect.any(Error));
  });

  it('should skip if already analyzing', async () => {
    const state = vi.mocked(await import('../../../extension/content/core/state.js')).state;
    state.isAnalyzing = true;

    await startAnalysis();

    expect(state.isAnalyzing).toBe(true);
  });

  it('should skip if no currentVideoId', async () => {
    const state = vi.mocked(await import('../../../extension/content/core/state.js')).state;
    state.currentVideoId = null;

    await startAnalysis();

    expect(state.isAnalyzing).toBe(false);
  });
});
