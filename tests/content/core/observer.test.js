import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../extension/content/core/state.js', () => ({
    state: { currentVideoId: null, settings: { autoAnalyze: true } },
    resetState: vi.fn(),
}));

vi.mock('../../../extension/content/ui/widget.js', () => ({
    injectWidget: vi.fn(),
}));

vi.mock('../../../extension/content/utils/dom.js', () => ({
    isWidgetProperlyVisible: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
    e: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
    ct: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/global.js', () => ({
    to: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
    on: vi.fn(),
    qs: vi.fn(),
    mo: vi.fn(() => ({ observe: vi.fn() })),
}));

vi.mock('../../../extension/content/core/analyzer.js', () => ({
    startAnalysis: vi.fn(),
}));

import { initObserver } from '../../../extension/content/core/observer.js';

describe('observer', () => {
    let mockState, mockResetState, mockInjectWidget, mockIsWidgetProperlyVisible, mockE, mockCt, mockTo, mockOn, mockQs, mockMo, mockStartAnalysis;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockState = (vi.mocked(await import('../../../extension/content/core/state.js'))).state;
        mockResetState = (vi.mocked(await import('../../../extension/content/core/state.js'))).resetState;
        mockInjectWidget = (vi.mocked(await import('../../../extension/content/ui/widget.js'))).injectWidget;
        mockIsWidgetProperlyVisible = (vi.mocked(await import('../../../extension/content/utils/dom.js'))).isWidgetProperlyVisible;
        mockE = (vi.mocked(await import('../../../extension/utils/shortcuts/log.js'))).e;
        mockCt = (vi.mocked(await import('../../../extension/utils/shortcuts/core.js'))).ct;
        mockTo = (vi.mocked(await import('../../../extension/utils/shortcuts/global.js'))).to;
        mockOn = (vi.mocked(await import('../../../extension/utils/shortcuts/dom.js'))).on;
        mockQs = (vi.mocked(await import('../../../extension/utils/shortcuts/dom.js'))).qs;
        mockMo = (vi.mocked(await import('../../../extension/utils/shortcuts/dom.js'))).mo;
        mockStartAnalysis = (vi.mocked(await import('../../../extension/content/core/analyzer.js'))).startAnalysis;

        // Mock location
        Object.defineProperty(window, 'location', {
            value: { href: 'https://www.youtube.com/watch?v=123', pathname: '/watch', search: '?v=123' },
            writable: true,
        });
    });

    describe('initObserver', () => {
        it('should initialize observers', () => {
            initObserver();

            expect(mockMo).toHaveBeenCalledTimes(2);
            expect(mockOn).toHaveBeenCalledWith(document, 'yt-navigate-finish', expect.any(Function));
        });

        it('should handle error', () => {
            mockMo.mockImplementation(() => { throw new Error('mo error'); });

            initObserver();

            expect(mockE).toHaveBeenCalledWith('Err:initObserver', expect.any(Error));
        });
    });
});