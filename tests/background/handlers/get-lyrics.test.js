// Mocks
vi.mock('../../../extension/api/genius-lyrics.js', () => ({
  geniusLyricsAPI: {
    getLyrics: vi.fn(),
  },
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { handleGetLyrics } from '../../../extension/background/handlers/get-lyrics.js';

describe('handleGetLyrics', () => {
  let mockGetLyrics, mockE, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLyrics = vi.mocked(
      require('../../../extension/api/genius-lyrics.js').geniusLyricsAPI.getLyrics
    );
    mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    mockRsp = vi.fn();
  });

  it('should get lyrics successfully', async () => {
    const req = { title: 'Song', artist: 'Artist' };
    mockGetLyrics.mockResolvedValue('Lyrics text');

    await handleGetLyrics(req, mockRsp);

    expect(mockGetLyrics).toHaveBeenCalledWith('Song', 'Artist');
    expect(mockRsp).toHaveBeenCalledWith({ success: true, result: 'Lyrics text' });
  });

  it('should handle error', async () => {
    const req = { title: 'Song', artist: 'Artist' };
    mockGetLyrics.mockRejectedValue(new Error('Not found'));

    await handleGetLyrics(req, mockRsp);

    expect(mockE).toHaveBeenCalledWith('[GetLyrics] Error:', expect.any(Error));
    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'Not found' });
  });
});
