import { SettingsManager } from "./modules/settings-manager.js";
import { AutoSave } from "./modules/auto-save.js";
import { UIManager } from "./modules/ui-manager.js";
import { GeneralSettings } from "./modules/general.js";
import { AIConfig } from "./modules/ai-config.js";
import { SegmentsConfig } from "./modules/segments.js";
import { ExternalAPIs } from "./modules/external-apis.js";
import { AdvancedSettings } from "./modules/advanced.js";
import { PerformanceSettings } from "./modules/performance.js";

document.addEventListener("DOMContentLoaded", async () => {
    const settingsManager = new SettingsManager();
    const autoSave = new AutoSave(settingsManager, 500);
    const uiManager = new UIManager();

    // Load settings
    await settingsManager.load();

    // Check onboarding
    const settings = settingsManager.get();
    const welcomeBanner = document.getElementById('welcome-banner');
    const startSetupBtn = document.getElementById('start-setup-btn');
    const dismissBannerBtn = document.getElementById('dismiss-banner-btn');

    if (!settings._meta?.onboardingCompleted && !settings.ai?.apiKey) {
        welcomeBanner.style.display = 'block';
    }

    startSetupBtn?.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/onboarding.html') });
    });

    dismissBannerBtn?.addEventListener('click', () => {
        welcomeBanner.style.display = 'none';
    });

    // Setup tabs
    uiManager.setupTabs();

    // Initialize modules with auto-save
    const modules = {
        general: new GeneralSettings(settingsManager, autoSave),
        aiConfig: new AIConfig(settingsManager, autoSave),
        segments: new SegmentsConfig(settingsManager, autoSave),
        externalApis: new ExternalAPIs(settingsManager, autoSave),
        advanced: new AdvancedSettings(settingsManager, autoSave),
        performance: new PerformanceSettings(settingsManager, autoSave)
    };

    // Init all modules
    Object.values(modules).forEach((m) => m.init());

    console.log('[Options] Initialized with auto-save');
});
