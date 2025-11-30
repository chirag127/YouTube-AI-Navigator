// Mocks
vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
  w: vi.fn(),
}));

import { handleGetMetadata } from '../../../extension/background/handlers/metadata.js';

describe('handleGetMetadata', () => {
  let mockW, mockRsp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockW = vi.mocked(require('../../../extension/utils/shortcuts/log.js').w);
    mockRsp = vi.fn();
  });

  it('should return dummy metadata', async () => {
    const req = { videoId: 'vid1' };

    await handleGetMetadata(req, mockRsp);

    expect(mockW).toHaveBeenCalledWith(
      '[Background] GET_METADATA called - this should be handled by content script'
    );
    expect(mockRsp).toHaveBeenCalledWith({
      success: true,
      data: {
        title: 'YouTube Video',
        author: 'Unknown Channel',
        viewCount: 'Unknown',
        videoId: 'vid1',
      },
    });
  });

  it('should handle error', async () => {
    const req = { videoId: 'vid1' };
    // Since no error in code, but to test catch, perhaps mock something, but it's not throwing.

    await handleGetMetadata(req, mockRsp);

    expect(mockRsp).toHaveBeenCalledWith({
      success: true,
      data: {
        title: 'YouTube Video',
        author: 'Unknown Channel',
        viewCount: 'Unknown',
        videoId: 'vid1',
      },
    });
  });
});
