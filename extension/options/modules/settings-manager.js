export class SettingsManager {
    constructor() {
        this.settings = {};
        this.listeners = [];
    }

    async load() {
        const result = await chrome.storage.sync.get('config');
        this.settings = result.config || this.getDefaults();
        return this.settings;
    }

    async save() {
        this.settings._meta = this.settings._meta || {};
        this.settings._meta.lastUpdated = Date.now();
        await chrome.storage.sync.set({ config: this.settings });
        this.notify();
    }

    get(path) {
        if (!path) return this.settings;
        return path.split('.').reduce((obj, key) => obj?.[key], this.settings);
    }

    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.settings);
        target[last] = value;
    }

    async update(path, value) {
        this.set(path, value);
        await this.save();
    }

    async reset() {
        this.settings = this.getDefaults();
        await this.save();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.settings));
    }

    getDefaults() {
        return {
            cache: { enabled: true, ttl: 86400000, transcripts: true, comments: true, metadata: true },
            scroll: { autoScrollToComments: false, scrollBackAfterComments: true, showScrollNotification: true, smoothScroll: true },
            transcript: { autoClose: true, autoCloseDelay: 1000, autoCloseOnCached: false, language: 'en', method: 'auto', includeTimestamps: true },
            comments: { enabled: true, limit: 20, includeReplies: false, sortBy: 'top', analyzeSentiment: true },
            metadata: { includeTitle: true, includeAuthor: true, includeViews: true, includeDuration: true, includeDescription: true, includeTags: true, includeUploadDate: true },
            ui: { theme: 'dark', widgetPosition: 'secondary', autoExpand: false, showTimestamps: true, compactMode: false },
            ai: { apiKey: '', model: 'gemini-2.0-flash-exp', customPrompt: '', outputLanguage: 'en', temperature: 0.7, maxTokens: 8192 },
            automation: { autoAnalyze: false },
            segments: { enabled: true, categories: {} },
            externalApis: { tmdb: '', newsData: '', googleFactCheck: '', twitchClientId: '', twitchAccessToken: '' },
            advanced: { debugMode: false, saveHistory: true, maxHistoryItems: 100, enableTelemetry: false },
            performance: { maxConcurrentRequests: 3, rateLimitDelay: 1000, retryAttempts: 3, retryDelay: 2000 },
            notifications: { enabled: true, position: 'top-right', duration: 3000, sound: false },
            _meta: { version: '1.0.0', lastUpdated: Date.now(), onboardingCompleted: false }
        };
    }

    export() {
        return JSON.stringify(this.settings, null, 2);
    }

    async import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = imported;
            await this.save();
            return true;
        } catch (e) {
            console.error('[Settings] Import failed:', e);
            return false;
        }
    }
}
