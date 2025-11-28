import { SettingsManager } from "./modules/settings-manager.js";
import { UIManager } from "./modules/ui-manager.js";
import { GeneralSettings } from "./modules/general.js";
import { AIConfig } from "./modules/ai-config.js";
import { SegmentsConfig } from "./modules/segments.js";
import { ExternalAPIs } from "./modules/external-apis.js";
import { AdvancedSettings } from "./modules/advanced.js";

document.addEventListener("DOMContentLoaded", async () => {
    const settingsManager = new SettingsManager();
    const uiManager = new UIManager();

    // Initialize Managers
    await settingsManager.load();

    // Check onboarding status and show banner if needed
    const settings = settingsManager.get();
    const welcomeBanner = document.getElementById('welcome-banner');
    const startSetupBtn = document.getElementById('start-setup-btn');
    const dismissBannerBtn = document.getElementById('dismiss-banner-btn');

    if (!settings.onboardingCompleted && !settings.apiKey) {
        welcomeBanner.style.display = 'block';
    }

    startSetupBtn?.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/onboarding.html') });
    });

    dismissBannerBtn?.addEventListener('click', () => {
        welcomeBanner.style.display = 'none';
    });

    // Setup Tabs
    uiManager.setupTabs((tabId) => {
        // Optional: Lazy load logic could go here
    });

    // Load Sections
    const container = document.getElementById("content-container");
    const sections = [
        "general",
        "ai-config",
        "segments",
        "external-apis",
        "advanced",
    ];

    // In a real dynamic setup, we'd fetch HTML here.
    // Since we pre-filled options.html shell for simplicity in this step,
    // we just need to init the JS modules.

    // Initialize Modules
    const modules = {
        general: new GeneralSettings(settingsManager, uiManager),
        aiConfig: new AIConfig(settingsManager, uiManager),
        segments: new SegmentsConfig(settingsManager, uiManager),
        externalApis: new ExternalAPIs(settingsManager, uiManager),
        advanced: new AdvancedSettings(settingsManager, uiManager),
    };

    // Init all modules
    Object.values(modules).forEach((m) => m.init());

    // Subscribe to settings changes to show toast
    settingsManager.subscribe(() => {
        uiManager.showToast("Settings saved");
    });
});
