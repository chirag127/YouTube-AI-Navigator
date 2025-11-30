import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
    ft: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
    id: vi.fn(),
    $$: vi.fn(),
    on: vi.fn(),
    ce: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/global.js', () => ({
    to: vi.fn(),
}));

import { UIManager } from '../../../extension/options/modules/ui-manager.js';

describe('UIManager', () => {
    let mockFt, mockId, mock$$, mockOn, mockCe, mockTo, manager;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFt = vi.mocked(require('../../../extension/utils/shortcuts/network.js').ft);
        mockId = vi.mocked(require('../../../extension/utils/shortcuts/dom.js').id);
        mock$$ = vi.mocked(require('../../../extension/utils/shortcuts/dom.js').$$);
        mockOn = vi.mocked(require('../../../extension/utils/shortcuts/dom.js').on);
        mockCe = vi.mocked(require('../../../extension/utils/shortcuts/log.js').ce);
        mockTo = vi.mocked(require('../../../extension/utils/shortcuts/global.js').to);
        manager = new UIManager();
    });

    it('should load section successfully', async () => {
        mockFt.mockResolvedValue({ text: vi.fn().mockResolvedValue('<div>content</div>') });

        const result = await manager.loadSection('general');

        expect(result).toBe('<div>content</div>');
    });

    it('should handle load error', async () => {
        mockFt.mockRejectedValue(new Error('Network error'));

        const result = await manager.loadSection('general');

        expect(result).toBe('<div class="error">Failed to load section: general</div>');
        expect(mockCe).toHaveBeenCalledWith('Failed to load section general:', expect.any(Error));
    });

    it('should show toast', () => {
        const el = { textContent: '', className: '', classList: { remove: vi.fn() } };
        mockId.mockReturnValue(el);
        mockTo.mockImplementation((fn) => fn());

        manager.showToast('Message', 'error');

        expect(el.textContent).toBe('Message');
        expect(el.className).toBe('toast show error');
        expect(mockTo).toHaveBeenCalled();
    });

    it('should setup sections', () => {
        const sections = [{ dataset: { section: 'general' }, classList: { remove: vi.fn(), add: vi.fn() } }];
        const contents = [{ classList: { remove: vi.fn(), add: vi.fn() } }];
        mock$$.mockReturnValueOnce(sections).mockReturnValueOnce(contents);
        mockId.mockReturnValue({ classList: { add: vi.fn() } });
        const cb = vi.fn();

        manager.setupSections(cb);

        expect(mockOn).toHaveBeenCalled();
    });
});