import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
    sl: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
    nw: vi.fn(() => 1000000000),
    ok: vi.fn(Object.keys),
}));

// Import after mocks
import { VideoCache } from '../../../extension/services/cache/video-cache.js';

describe('VideoCache', () => {
    let cache;
    let mockSl, mockNw, mockOk;

    beforeEach(() => {
        vi.clearAllMocks();
        cache = new VideoCache();

        mockSl = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').sl);
        mockNw = vi.mocked(require('../../../extension/utils/shortcuts/core.js').nw);
        mockOk = vi.mocked(require('../../../extension/utils/shortcuts/core.js').ok);
    });

    describe('get', () => {
        it('should return data from memory cache if not expired', async () => {
            const testData = { test: 'data' };
            cache.m.set('id1:metadata', { d: testData, ts: 999999999 });

            const result = await cache.get('id1', 'metadata');

            expect(result).toEqual(testData);
            expect(mockSl).not.toHaveBeenCalled();
        });

        it('should remove expired memory cache and check storage', async () => {
            cache.m.set('id1:metadata', { d: 'old', ts: 900000000 });
            mockSl.mockResolvedValue({ video_id1_metadata: { v: 1, ts: 950000000, d: 'fresh' } });

            const result = await cache.get('id1', 'metadata');

            expect(cache.m.has('id1:metadata')).toBe(false);
            expect(result).toBe('fresh');
            expect(cache.m.get('id1:metadata')).toEqual({ d: 'fresh', ts: 950000000 });
        });

        it('should return data from storage if valid', async () => {
            mockSl.mockResolvedValue({ video_id1_metadata: { v: 1, ts: 999999999, d: 'stored' } });

            const result = await cache.get('id1', 'metadata');

            expect(result).toBe('stored');
            expect(cache.m.get('id1:metadata')).toEqual({ d: 'stored', ts: 999999999 });
        });

        it('should return null for expired storage data', async () => {
            mockSl.mockResolvedValue({ video_id1_metadata: { v: 1, ts: 900000000, d: 'expired' } });

            const result = await cache.get('id1', 'metadata');

            expect(result).toBeNull();
            expect(mockSl).toHaveBeenCalledWith('video_id1_metadata', null);
        });

        it('should return null for wrong version', async () => {
            mockSl.mockResolvedValue({ video_id1_metadata: { v: 2, ts: 999999999, d: 'wrong version' } });

            const result = await cache.get('id1', 'metadata');

            expect(result).toBeNull();
            expect(mockSl).toHaveBeenCalledWith('video_id1_metadata', null);
        });

        it('should return null when no data', async () => {
            mockSl.mockResolvedValue({});

            const result = await cache.get('id1', 'metadata');

            expect(result).toBeNull();
        });
    });

    describe('set', () => {
        it('should store data in memory and storage', async () => {
            const testData = { test: 'data' };

            await cache.set('id1', 'metadata', testData);

            expect(cache.m.get('id1:metadata')).toEqual({ d: testData, ts: 1000000000 });
            expect(mockSl).toHaveBeenCalledWith({ video_id1_metadata: { v: 1, ts: 1000000000, d: testData } });
        });
    });

    describe('clear', () => {
        it('should clear specific video data', async () => {
            cache.m.set('id1:metadata', { d: 'data', ts: 1000000000 });
            cache.m.set('id1:transcript', { d: 'data', ts: 1000000000 });
            mockSl.mockResolvedValue();

            await cache.clear('id1');

            expect(cache.m.has('id1:metadata')).toBe(false);
            expect(cache.m.has('id1:transcript')).toBe(false);
            expect(mockSl).toHaveBeenCalledTimes(3); // for metadata, transcript, comments
        });

        it('should clear all cache', async () => {
            cache.m.set('id1:metadata', { d: 'data', ts: 1000000000 });
            mockSl.mockResolvedValueOnce({ video_id1_metadata: 'data', other_key: 'value' });
            mockOk.mockReturnValue(['video_id1_metadata', 'other_key']);

            await cache.clear();

            expect(cache.m.size).toBe(0);
            expect(mockSl).toHaveBeenCalledWith(['video_id1_metadata'], null);
        });
    });
});