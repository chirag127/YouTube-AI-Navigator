import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
    e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
    slg: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
    assign: vi.fn(),
}));

import { state, resetState, loadSettings } from '../../../extension/content/core/state.js';

describe('state', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should have initial state', () => {
        expect(state.currentVideoId).toBe(null);
        expect(state.isAnalyzing).toBe(false);
        expect(state.analysisData).toBe(null);
        expect(state.currentTranscript).toEqual([]);
        expect(state.settings.autoAnalyze).toBe(true);
    });

    describe('resetState', () => {
        it('should reset state', () => {
            state.isAnalyzing = true;
            state.analysisData = 'data';
            state.currentTranscript = ['t'];

            resetState();

            expect(state.isAnalyzing).toBe(false);
            expect(state.analysisData).toBe(null);
            expect(state.currentTranscript).toEqual([]);
        });
    });

    describe('loadSettings', () => {
        it('should load settings', async () => {
            const slg = (await import('../../../extension/utils/shortcuts/storage.js')).slg;
            slg.mockResolvedValue({ autoAnalyze: false });
            const assign = (await import('../../../extension/utils/shortcuts/core.js')).assign;
            assign.mockImplementation((target, source) => Object.assign(target, source));

            const result = await loadSettings();

            expect(slg).toHaveBeenCalledWith([
                'autoAnalyze',
                'autoSkipSponsors',
                'autoSkipIntros',
                'autoLike',
                'autoLikeThreshold',
                'autoLikeLive',
                'likeIfNotSubscribed',
            ]);
            expect(assign).toHaveBeenCalledWith(state.settings, { autoAnalyze: false });
            expect(result).toEqual(state.settings);
        });

        it('should handle error', async () => {
            const slg = (await import('../../../extension/utils/shortcuts/storage.js')).slg;
            slg.mockRejectedValue(new Error('storage error'));
            const e = (await import('../../../extension/utils/shortcuts/log.js')).e;

            const result = await loadSettings();

            expect(e).toHaveBeenCalledWith('Err:loadSettings', expect.any(Error));
            expect(result).toEqual(state.settings);
        });
    });
});