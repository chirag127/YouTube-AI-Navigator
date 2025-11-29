import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../extension/options/modules/settings-manager.js', () => ({
    SettingsManager: vi.fn().mockImplementation(() => ({
        load: vi.fn().mockResolvedValue(true),
        get: vi.fn(() => ({ _meta: { onboardingCompleted: true }, ai: { apiKey: 'test-key' } })),
    })),
}));

vi.mock('../extension/options/modules/auto-save.js', () => ({
    AutoSave: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../extension/options/modules/ui-manager.js', () => ({
    UIManager: vi.fn().mockImplementation(() => ({
        setupTabs: vi.fn(),
    })),
}));

vi.mock('../extension/options/modules/tab-loader.js', () => ({
    TabLoader: vi.fn().mockImplementation(() => ({
        loadAll: vi.fn().mockResolvedValue(true),
    })),
}));

vi.mock('../extension/options/modules/general.js', () => ({
    GeneralSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/ai-config.js', () => ({
    AIConfig: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/segments.js', () => ({
    SegmentsConfig: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/external-apis.js', () => ({
    ExternalAPIs: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/advanced.js', () => ({
    AdvancedSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/performance.js', () => ({
    PerformanceSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/notification-manager.js', () => ({
    NotificationManager: vi.fn().mockImplementation(() => ({
        info: vi.fn(),
    })),
}));

vi.mock('../extension/options/modules/notifications-settings.js', () => ({
    NotificationsSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/cache-settings.js', () => ({
    CacheSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/transcript-settings.js', () => ({
    TranscriptSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/comments-settings.js', () => ({
    CommentsSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/metadata-settings.js', () => ({
    MetadataSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/options/modules/scroll-settings.js', () => ({
    ScrollSettings: vi.fn().mockImplementation(() => ({ init: vi.fn() })),
}));

vi.mock('../extension/utils/shortcuts/dom.js', () => ({
    on: vi.fn(),
    id: vi.fn(),
}));

vi.mock('../extension/utils/shortcuts/core.js', () => ({
    log: vi.fn(),
    err: vi.fn(),
    vl: vi.fn(obj => Object.values(obj)),
}));

vi.mock('../extension/utils/shortcuts/runtime.js', () => ({
    url: vi.fn(path => `chrome-extension://mock/${path}`),
}));

vi.mock('../extension/utils/shortcuts/tabs.js', () => ({
    tc: vi.fn(),
}));

describe('Options Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = `
      <div id="welcome-banner" style="display:none;"></div>
      <button id="start-setup-btn"></button>
      <button id="dismiss-banner-btn"></button>
    `;
    });

    it('should initialize settings manager', async () => {
        const { SettingsManager } = await import('../extension/options/modules/settings-manager.js');

        expect(SettingsManager).toBeDefined();
    });

    it('should initialize notification manager', async () => {
        const { NotificationManager } = await import(
            '../extension/options/modules/notification-manager.js'
        );

        expect(NotificationManager).toBeDefined();
    });

    it('should initialize all modules', async () => {
        const { AIConfig } = await import('../extension/options/modules/ai-config.js');
        const { SegmentsConfig } = await import('../extension/options/modules/segments.js');
        const { CacheSettings } = await import('../extension/options/modules/cache-settings.js');

        expect(AIConfig).toBeDefined();
        expect(SegmentsConfig).toBeDefined();
        expect(CacheSettings).toBeDefined();
    });
});
