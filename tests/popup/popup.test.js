import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../extension/utils/shortcuts/dom.js', () => ({
    qs: vi.fn(),
    rc: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/storage.js', () => ({
    slg: vi.fn(),
    sg: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/log.js', () => ({
    w: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/global.js', () => ({
    to: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/tabs.js', () => ({
    tq: vi.fn(),
    tm: vi.fn(),
    tbc: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/runtime.js', () => ({
    ru: vi.fn(),
    ro: vi.fn(),
}));

// Mock DOM elements
const mockApiStatus = {
    innerHTML: '',
    className: '',
    style: { display: '' },
};

const mockPageStatus = {
    innerHTML: '',
    className: '',
};

const mockAnalyzeBtn = {
    disabled: false,
    onclick: null,
};

const mockHistoryBtn = {
    onclick: null,
};

const mockOptionsBtn = {
    onclick: null,
};

const mockMessage = {
    textContent: '',
    className: '',
};

const mockSetupGuideBtn = {
    style: { display: '' },
    onclick: null,
};

vi.mocked(require('../../extension/utils/shortcuts/dom.js').qs).mockImplementation((selector) => {
    switch (selector) {
        case '#api-status': return mockApiStatus;
        case '#page-status': return mockPageStatus;
        case '#analyze-btn': return mockAnalyzeBtn;
        case '#history-btn': return mockHistoryBtn;
        case '#options-btn': return mockOptionsBtn;
        case '#message': return mockMessage;
        case '#setup-guide-btn': return mockSetupGuideBtn;
        default: return null;
    }
});

// Import after mocks
import '../../extension/popup/popup.js';

describe('Popup', () => {
    let mockSl, mockSg, mockW, mockTo, mockTq, mockTm, mockTc, mockRu, mockRo;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSl = vi.mocked(require('../../extension/utils/shortcuts/storage.js').slg);
        mockSg = vi.mocked(require('../../extension/utils/shortcuts/storage.js').sg);
        mockW = vi.mocked(require('../../extension/utils/shortcuts/log.js').w);
        mockTo = vi.mocked(require('../../extension/utils/shortcuts/global.js').to);
        mockTq = vi.mocked(require('../../extension/utils/shortcuts/tabs.js').tq);
        mockTm = vi.mocked(require('../../extension/utils/shortcuts/tabs.js').tm);
        mockTc = vi.mocked(require('../../extension/utils/shortcuts/tabs.js').tbc);
        mockRu = vi.mocked(require('../../extension/utils/shortcuts/runtime.js').ru);
        mockRo = vi.mocked(require('../../extension/utils/shortcuts/runtime.js').ro);
    });

    describe('checkApi', () => {
        it('should show configured when API key exists in config', async () => {
            mockSg.mockResolvedValue({ config: { ai: { GAK: 'test-key' } } });
            mockSl.mockResolvedValue({ GAK: '' });

            const result = await checkApi();

            expect(result).toBe(true);
            expect(mockApiStatus.innerHTML).toBe('<span>✅ Configured</span>');
            expect(mockApiStatus.className).toBe('value success');
            expect(mockSetupGuideBtn.style.display).toBe('none');
        });

        it('should show configured when API key exists in localStorage', async () => {
            mockSg.mockResolvedValue({ config: {} });
            mockSl.mockResolvedValue({ GAK: 'test-key' });

            const result = await checkApi();

            expect(result).toBe(true);
            expect(mockApiStatus.innerHTML).toBe('<span>✅ Configured</span>');
        });

        it('should show not configured when no API key', async () => {
            mockSg.mockResolvedValue({ config: {} });
            mockSl.mockResolvedValue({ GAK: '' });

            const result = await checkApi();

            expect(result).toBe(false);
            expect(mockApiStatus.innerHTML).toBe('<span>⚠️ Not configured</span>');
            expect(mockApiStatus.className).toBe('value warning');
            expect(mockSetupGuideBtn.style.display).toBe('block');
        });

        it('should handle errors', async () => {
            mockSg.mockRejectedValue(new Error('Storage error'));

            const result = await checkApi();

            expect(result).toBe(false);
            expect(mockW).toHaveBeenCalledWith('API check failed:', expect.any(Error));
        });
    });

    describe('checkPage', () => {
        it('should show success for YouTube video page', async () => {
            const mockTab = { url: 'https://www.youtube.com/watch?v=123' };
            mockTq.mockResolvedValue([mockTab]);

            const result = await checkPage();

            expect(result).toBe(true);
            expect(mockPageStatus.innerHTML).toBe('<span>✅ YouTube Video</span>');
            expect(mockPageStatus.className).toBe('value success');
            expect(mockAnalyzeBtn.disabled).toBe(false);
        });

        it('should show warning for non-YouTube page', async () => {
            const mockTab = { url: 'https://www.google.com' };
            mockTq.mockResolvedValue([mockTab]);

            const result = await checkPage();

            expect(result).toBe(false);
            expect(mockPageStatus.innerHTML).toBe('<span>⚠️ Not on YouTube</span>');
            expect(mockPageStatus.className).toBe('value warning');
            expect(mockAnalyzeBtn.disabled).toBe(true);
        });

        it('should handle no active tab', async () => {
            mockTq.mockResolvedValue([]);

            const result = await checkPage();

            expect(result).toBe(false);
            expect(mockPageStatus.innerHTML).toBe('<span>⚠️ Not on YouTube</span>');
        });

        it('should handle errors', async () => {
            mockTq.mockRejectedValue(new Error('Tabs error'));

            const result = await checkPage();

            expect(result).toBe(false);
            expect(mockW).toHaveBeenCalledWith('Page check failed:', expect.any(Error));
        });
    });

    describe('showMsg', () => {
        it('should display message and auto-hide', () => {
            showMsg('Test message', 'success');

            expect(mockMessage.textContent).toBe('Test message');
            expect(mockMessage.className).toBe('show success');
            expect(mockTo).toHaveBeenCalledWith(expect.any(Function), 3000);
        });

        it('should use default type', () => {
            showMsg('Info message');

            expect(mockMessage.className).toBe('show info');
        });
    });

    describe('button handlers', () => {
        it('should handle analyze button click', async () => {
            const mockTab = { id: 1 };
            mockTq.mockResolvedValue([mockTab]);
            mockTm.mockResolvedValue();

            await mockAnalyzeBtn.onclick();

            expect(mockTq).toHaveBeenCalledWith({ active: true, currentWindow: true });
            expect(mockTm).toHaveBeenCalledWith(1, { action: 'ANALYZE_VIDEO' });
            expect(mockMessage.textContent).toBe('Analysis started!');
            expect(mockMessage.className).toBe('show success');
        });

        it('should handle analyze button error', async () => {
            mockTq.mockRejectedValue(new Error('Tab error'));

            await mockAnalyzeBtn.onclick();

            expect(mockMessage.textContent).toBe('Failed to start analysis');
            expect(mockMessage.className).toBe('show error');
        });

        it('should handle history button click', () => {
            mockRu.mockReturnValue('chrome-extension://id/history/history.html');

            mockHistoryBtn.onclick();

            expect(mockTc).toHaveBeenCalledWith({ url: 'chrome-extension://id/history/history.html' });
        });

        it('should handle options button click', () => {
            mockOptionsBtn.onclick();

            expect(mockRo).toHaveBeenCalled();
        });

        it('should handle setup guide button click', () => {
            mockSetupGuideBtn.onclick();

            expect(mockRo).toHaveBeenCalled();
        });
    });
});