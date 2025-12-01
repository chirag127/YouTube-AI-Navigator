// Mocks
vi.mock('../../../extension/background/services.js', () => ({
  initializeServices: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock('../../../extension/background/utils/api-key.js', () => ({
  getApiKey: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/math.js', () => ({
  flr: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
  am: vi.fn(),
  ajn: vi.fn(),
  isa: vi.fn(),
}));

import { handleGenerateSummary } from '../../../extension/background/handlers/summary.js';

describe('handleGenerateSummary', () => {
  let mockInitializeServices,
    mockGetServices,
    mockGetApiKey,
    mockFlr,
    mockAm,
    mockAjn,
    mockIsa,
    mockGemini,
    mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInitializeServices = vi.mocked(
      require('../../../extension/background/services.js').initializeServices
    );
    mockGetServices = vi.mocked(require('../../../extension/background/services.js').getServices);
    mockGetApiKey = vi.mocked(require('../../../extension/background/utils/api-key.js').getApiKey);
    mockFlr = vi.mocked(vi.fn().flr);
    mockAm = vi.mocked(vi.fn().am);
    mockAjn = vi.mocked(vi.fn().ajn);
    mockIsa = vi.mocked(vi.fn().isa);
    mockGemini = { generateSummary: vi.fn() };
    mockGetServices.mockReturnValue({ gemini: mockGemini });
    mockRsp = vi.fn();

    // Setup mocks
    mockFlr.mockImplementation(Math.floor);
    mockIsa.mockReturnValue(true);
    mockAm.mockImplementation((arr, fn) => arr.map(fn));
    mockAjn.mockImplementation((arr, sep) => arr.join(sep));
  });

  it('should generate summary successfully', async () => {
    const req = {
      transcript: [{ start: 10, text: 'Hello' }],
      settings: {},
      metadata: { title: 'Title', author: 'Author' },
    };
    mockGetApiKey.mockResolvedValue('key');
    mockInitializeServices.mockResolvedValue();
    mockGemini.generateSummary.mockResolvedValue('Summary text');

    await handleGenerateSummary(req, mockRsp);

    expect(mockGemini.generateSummary).toHaveBeenCalledWith(
      expect.stringContaining('Title'),
      undefined,
      undefined,
      { length: undefined, language: undefined }
    );
    expect(mockRsp).toHaveBeenCalledWith({ success: true, data: 'Summary text' });
  });

  it('should handle string transcript', async () => {
    const req = { transcript: 'Plain text', settings: {}, metadata: {} };
    mockGetApiKey.mockResolvedValue('key');
    mockInitializeServices.mockResolvedValue();
    mockIsa.mockReturnValue(false);
    mockGemini.generateSummary.mockResolvedValue('Summary');

    await handleGenerateSummary(req, mockRsp);

    expect(mockRsp).toHaveBeenCalledWith({ success: true, data: 'Summary' });
  });

  it('should handle no apiKey', async () => {
    const req = { transcript: [], settings: {} };
    mockGetApiKey.mockResolvedValue(null);

    await handleGenerateSummary(req, mockRsp);

    expect(mockRsp).toHaveBeenCalledWith({ success: false, error: 'API Key not configured' });
  });
});
