import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
    ft: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
    e: vi.fn(),
}));

import { handleGetVideoInfo } from '../../../extension/background/handlers/video-info.js';

describe('handleGetVideoInfo', () => {
    let mockFt, mockE;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFt = vi.mocked(require('../../../extension/utils/shortcuts/network.js').ft);
        mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    });

    it('should get video info successfully', async () => {
        const videoId = 'vid1';
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ title: 'Test Video', author_name: 'Channel' }),
        };
        mockFt.mockResolvedValue(mockResponse);

        const result = await handleGetVideoInfo({ videoId });

        expect(mockFt).toHaveBeenCalledWith('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=vid1&format=json');
        expect(result).toEqual({
            success: true,
            metadata: {
                title: 'Test Video',
                author: 'Channel',
                videoId: 'vid1',
                viewCount: 'Unknown',
                lengthSeconds: 0,
            },
        });
    });

    it('should handle fetch failure', async () => {
        const videoId = 'vid1';
        mockFt.mockResolvedValue({ ok: false });

        const result = await handleGetVideoInfo({ videoId });

        expect(result).toEqual({ success: false, error: 'Failed to fetch oEmbed' });
    });

    it('should handle error', async () => {
        const videoId = 'vid1';
        mockFt.mockRejectedValue(new Error('Network error'));

        const result = await handleGetVideoInfo({ videoId });

        expect(mockE).toHaveBeenCalledWith('[VideoInfo] Error:', expect.any(Error));
        expect(result).toEqual({ success: false, error: 'Network error' });
    });
});