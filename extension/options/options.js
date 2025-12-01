import { SettingsManager } from './modules/settings-manager.js';
import { UIAppearance } from './modules/ui-appearance.js';
import { AutoSave } from './modules/auto-save.js';
import { UIManager } from './modules/ui-manager.js';
import { SectionLoader } from './modules/section-loader.js';
import { GeneralSettings } from './modules/general.js';
import { AIConfig } from './modules/ai-config.js';
import { SegmentsConfig } from './modules/segments.js';
import { ExternalAPIs } from './modules/external-apis.js';
import { AdvancedSettings } from './modules/advanced.js';
import { PerformanceSettings } from './modules/performance.js';
import { NotificationManager } from './modules/notification-manager.js';
import { NotificationsSettings } from './modules/notifications-settings.js';
import { CacheSettings } from './modules/cache-settings.js';
import { TranscriptSettings } from './modules/transcript-settings.js';
import { CommentsSettings } from './modules/comments-settings.js';
import { MetadataSettings } from './modules/metadata-settings.js';
import { ScrollSettings } from './modules/scroll-settings.js';
import { WidgetSettings } from './modules/widget-settings.js';
import { IntegrationsSettings } from './modules/integrations.js';
import { PromptsSettings } from './modules/prompts.js';


import { vl as vs } from '../utils/shortcuts/core.js';


(document)?.addEventListener('DOMContentLoaded', async () => {
  const settingsManager = new SettingsManager();
  const notificationManager = new NotificationManager();
  const autoSave = new AutoSave(settingsManager, 300, notificationManager);
  const uiManager = new UIManager();
  const sectionLoader = new SectionLoader();
  await settingsManager.load();
  notificationManager.info('Settings loaded successfully');
  await sectionLoader.loadAll();
  const settings = settingsManager.get();
  const welcomeBanner = document.getElementById('#welcome-banner');
  const startSetupBtn = document.getElementById('#start-setup-btn');
  const dismissBannerBtn = document.getElementById('#dismiss-banner-btn');
  if (!settings._meta?.onboardingCompleted && !settings.ai?.apiKey) {
    if (welcomeBanner) welcomeBanner.style.display = 'block';
  }
  startSetupBtn &&
    (startSetupBtn)?.addEventListener('click', () => {
      tc({ url: chrome.runtime.getURL('onboarding/onboarding.html') });
    });
  dismissBannerBtn &&
    (dismissBannerBtn)?.addEventListener('click', () => {
      if (welcomeBanner) welcomeBanner.style.display = 'none';
    });
  uiManager.setupSections();
  const modules = {
    general: new GeneralSettings(settingsManager, autoSave), uiAppearance: new UIAppearance(settingsManager, autoSave), aiConfig: new AIConfig(settingsManager, autoSave), segments: new SegmentsConfig(settingsManager, autoSave), externalApis: new ExternalAPIs(settingsManager, autoSave), advanced: new AdvancedSettings(settingsManager, autoSave), performance: new PerformanceSettings(settingsManager, autoSave), notifications: new NotificationsSettings(settingsManager, autoSave), cache: new CacheSettings(settingsManager, autoSave), transcript: new TranscriptSettings(settingsManager, autoSave), comments: new CommentsSettings(settingsManager, autoSave), metadata: new MetadataSettings(settingsManager, autoSave), scroll: new ScrollSettings(settingsManager, autoSave), widget: new WidgetSettings(settingsManager, notificationManager), integrations: new IntegrationsSettings(settingsManager, notificationManager), prompts: new PromptsSettings(settingsManager, autoSave), };
  const initPromises = vs(modules).map(async m => {
    try {
      await m.init();
    } catch (x) {
      console.error(`[Options] Failed to init ${m.constructor.name}:`, x);
    }
  });
  await Promise.allSettled(initPromises);
});
