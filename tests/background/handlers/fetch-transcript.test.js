// Mocks
vi.mock('../../../extension/utils/shortcuts/string.js', () => ({
  rp: vi.fn(),
  trm: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/global.js', () => ({
  pf: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  jp: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
  afl: vi.fn(),
  am: vi.fn(),
  ajn: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
  ft: vi.fn(),
}));

import { handleFetchTranscript } from '../../../extension/background/handlers/fetch-transcript.js';

describe('handleFetchTranscript', () => {
  let mockRp, mockTrm, mockPf, mockJp, mockAfl, mockAm, mockAjn, mockFt, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRp = vi.mocked(vi.fn().rp);
    mockTrm = vi.mocked(vi.fn().trm);
    mockPf = vi.mocked(vi.fn().pf);
    mockJp = vi.mocked(vi.fn().jp);
    mockAfl = vi.mocked(vi.fn().afl);
    mockAm = vi.mocked(vi.fn().am);
    mockAjn = vi.mocked(vi.fn().ajn);
    mockFt = vi.mocked(vi.fn().ft);
    mockRsp = vi.fn();

    // Setup common mocks
    mockPf.mockImplementation(Number.parseFloat);
    mockTrm.mockImplementation(s => s && s.trim().length > 0);
    mockRp.mockImplementation((str, regex, repl) => str.replace(regex, repl));
    mockJp.mockImplementation(JSON.parse);
    mockAfl.mockImplementation((arr, fn) => arr.flatMap(fn));
    mockAm.mockImplementation((arr, fn) => arr.map(fn));
    mockAjn.mockImplementation((arr, sep) => arr.join(sep));
  });

  describe('dec function', () => {
    // Since it's internal, test through handleFetchTranscript or mock
    // For simplicity, assume it's tested indirectly
  });

  describe('pXML function', () => {
    // Internal
  });

  describe('fYT function', () => {
    // Internal
  });

  describe('handleFetchTranscript', () => {
    it('should fetch transcript successfully with json3', async () => {
      const req = { videoId: 'vid1', lang: 'en' };
      mockFt.mockResolvedValue('{"events":[{"segs":[{"utf8":"Hello"}]}]}');
      mockJp.mockReturnValue({ events: [{ segs: [{ utf8: 'Hello' }] }] });
      mockAfl.mockReturnValue([{ utf8: 'Hello' }]);
      mockAm.mockReturnValue([{ tStartMs: 1000, dDurationMs: 2000, segs: [{ utf8: 'Hello' }] }]);
      mockAm.mockReturnValue([{ start: 1, duration: 2, text: 'Hello' }]);

      await handleFetchTranscript(req, mockRsp);

      expect(mockFt).toHaveBeenCalledWith(
        'https://www.youtube.com/api/timedtext?v=vid1&lang=en&fmt=json3'
      );
      expect(mockRsp).toHaveBeenCalledWith({
        success: true,
        data: [{ start: 1, duration: 2, text: 'Hello' }],
      });
    });

    it('should fallback to srv3 if json3 fails', async () => {
      const req = { videoId: 'vid1' };
      mockFt.mockResolvedValueOnce(null); // json3 fails
      mockFt.mockResolvedValueOnce('<text start="1.0" dur="2.0">Hello</text>'); // srv3 succeeds

      await handleFetchTranscript(req, mockRsp);

      expect(mockFt).toHaveBeenCalledTimes(2);
      expect(mockRsp).toHaveBeenCalledWith({
        success: true,
        data: [{ start: 1, duration: 2, text: 'Hello' }],
      });
    });

    it('should return error if all methods fail', async () => {
      const req = { videoId: 'vid1' };
      mockFt.mockResolvedValue(null);

      await handleFetchTranscript(req, mockRsp);

      expect(mockRsp).toHaveBeenCalledWith({
        success: false,
        error: 'All transcript fetch methods failed',
      });
    });
  });
});
