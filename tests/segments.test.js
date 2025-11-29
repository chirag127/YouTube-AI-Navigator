import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SegmentsConfig } from '../extension/options/modules/segments.js';

vi.mock('../extension/utils/shortcuts/dom.js', () => ({
    qs: vi.fn(),
    on: vi.fn(),
}));

vi.mock('../extension/utils/shortcuts/global.js', () => ({
    pf: vi.fn(v => parseFloat(v)),
}));

vi.mock('../extension/options/modules/settings-manager.js', () => ({
    SEGMENT_CATEGORIES: [
        { id: 'sponsor', label: 'Sponsor', color: '#00d400' },
        { id: 'interaction', label: 'Interaction Reminder', color: '#cc00ff' },
    ],
    DEFAULT_SEGMENT_CONFIG: { action: 'ignore', speed: 2.0 },
}));

import { qs } from '../extension/utils/shortcuts/dom.js';

describe('SegmentsConfig', () => {
    let segmentsConfig;
    let mockSettingsManager;
    let mockAutoSave;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSettingsManager = {
            get: vi.fn(() => ({
                segments: {
                    enabled: true,
                    categories: {
                        sponsor: { action: 'skip', speed: 2.0 },
                    },
                },
            })),
        };
        mockAutoSave = {
            save: vi.fn(),
        };
        segmentsConfig = new SegmentsConfig(mockSettingsManager, mockAutoSave);
    });

    it('should initialize with settings', () => {
        expect(segmentsConfig.s).toBe(mockSettingsManager);
        expect(segmentsConfig.a).toBe(mockAutoSave);
    });

    it('should update segment configuration', async () => {
        await segmentsConfig.update('sponsor', { action: 'speed', speed: 1.5 });

        expect(mockAutoSave.save).toHaveBeenCalledWith(
            'segments.categories',
            expect.objectContaining({
                sponsor: expect.objectContaining({ action: 'speed', speed: 1.5 }),
            })
        );
    });
});
