import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
    msg: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
    e: vi.fn(),
}));

import { analyzeVideo } from '../../../extension/content/features/analysis/service.js';

describe('analyzeVideo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should analyze video successfully', async () => {
        const msg = (vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js'))).msg;
        msg.mockResolvedValue({ success: true, data: 'result' });

        const result = await analyzeVideo('transcript', 'metadata', 'comments');

        expect(msg).toHaveBeenCalledWith({
            action: 'ANALYZE_VIDEO',
            transcript: 'transcript',
            metadata: 'metadata',
            comments: 'comments',
            options: { length: 'Medium' },
        });
        expect(result).toEqual({ success: true, data: 'result' });
    });

    it('should handle error', async () => {
        const msg = (vi.mocked(await import('../../../extension/utils/shortcuts/runtime.js'))).msg;
        msg.mockRejectedValue(new Error('msg error'));
        const e = (vi.mocked(await import('../../../extension/utils/shortcuts/log.js'))).e;

        await expect(analyzeVideo('t', 'm', 'c')).rejects.toThrow('msg error');
        expect(e).toHaveBeenCalledWith('Err:analyzeVideo', expect.any(Error));
    });
});