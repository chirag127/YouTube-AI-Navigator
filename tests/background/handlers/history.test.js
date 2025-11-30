// Mocks
vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  slg: vi.fn(),
  sls: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  nw: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { handleSaveToHistory } from '../../../extension/background/handlers/history.js';

describe('handleSaveToHistory', () => {
  let mockSlg, mockSls, mockNw, mockE, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSlg = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').slg);
    mockSls = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').sls);
    mockNw = vi.mocked(require('../../../extension/utils/shortcuts/core.js').nw);
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockNw.mockReturnValue(1234567890);
    mockRsp = vi.fn();
  });

  it('should save to history successfully', async () => {
    const req = { data: { videoId: 'vid1', title: 'Title', summary: 'Sum' } };
    mockSlg.mockResolvedValue({ summaryHistory: [] });
    mockSls.mockResolvedValue();

    await handleSaveToHistory(req, mockRsp);

    expect(mockSlg).toHaveBeenCalledWith('summaryHistory');
    expect(mockSls).toHaveBeenCalledWith({
      summaryHistory: [{ videoId: 'vid1', title: 'Title', summary: 'Sum', timestamp: 1234567890 }],
    });
    expect(mockRsp).toHaveBeenCalledWith({ success: true });
  });

  it('should handle existing history', async () => {
    const req = { videoId: 'vid2', title: 'Title2', summary: 'Sum2' };
    mockSlg.mockResolvedValue({
      summaryHistory: [{ videoId: 'vid1', title: 'Old', summary: 'Old', timestamp: 1000 }],
    });
    mockSls.mockResolvedValue();

    await handleSaveToHistory(req, mockRsp);

    expect(mockSls).toHaveBeenCalledWith({
      summaryHistory: [
        { videoId: 'vid2', title: 'Title2', summary: 'Sum2', timestamp: 1234567890 },
        { videoId: 'vid1', title: 'Old', summary: 'Old', timestamp: 1000 },
      ],
    });
  });

  it('should limit history to 100', async () => {
    const req = { videoId: 'vid101', title: 'Title', summary: 'Sum' };
    const existing = Array(100)
      .fill()
      .map((_, i) => ({ videoId: `vid${i}`, title: 'T', summary: 'S', timestamp: i }));
    mockSlg.mockResolvedValue({ summaryHistory: existing });
    mockSls.mockResolvedValue();

    await handleSaveToHistory(req, mockRsp);

    const calledWith = mockSls.mock.calls[0][0].summaryHistory;
    expect(calledWith).toHaveLength(100);
    expect(calledWith[0].videoId).toBe('vid101');
  });

  it('should handle error', async () => {
    const req = { videoId: 'vid1', title: 'Title', summary: 'Sum' };
    mockSlg.mockRejectedValue(new Error('Storage error'));

    await handleSaveToHistory(req, mockRsp);

    expect(mockE).toHaveBeenCalledWith('SaveHistory:', expect.any(Error));
    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'Storage error' });
  });
});
