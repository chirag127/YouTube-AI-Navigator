// Configuration Manager - Single Source of Truth
// All extension settings with defaults

export const DEFAULT_CONFIG = {
    // === CACHE SETTINGS ===
    cache: {
        enabled: true,
        ttl: 24 * 60 * 60 * 1000, // 24 hours in ms
        transcripts: true,
        comments: true,
        metadata: true
    },

    // === SCROLL BEHAVIOR ===
    scroll: {
        autoScrollToComments: false, // DISABLED by default per user request
        scrollBackAfterComments: true,
        showScrollNotification: true,
        smoothScroll: true
    },

    // === TRANSCRIPT SETTINGS ===
    transcript: {
        autoClose: true,
        autoCloseDelay: 1000, // ms
        autoCloseOnCached: false, // Don't close if from cache
        language: 'en',
        method: 'auto', // auto, innertube, invidious, dom, piped
        includeTimestamps: true
    },

    // === COMMENTS SETTINGS ===
    comments: {
        enabled: true,
        limit: 20,
        includeReplies: false,
        sortBy: 'top', // top, new
        analyzeSentiment: true
    },

    // === METADATA SETTINGS ===
    metadata: {
        includeTitle: true,
        includeAuthor: true,
        includeViews: true,
        includeDuration: true,
        includeDescription: true,
        includeTags: true,
        includeUploadDate: true
    },

    // === UI SETTINGS ===
    ui: {
        theme: 'dark', // dark, light, auto
        widgetPosition: 'secondary', // secondary, primary
        autoExpand: false,
        showTimestamps: true,
        compactMode: false
    },

    // === AI SETTINGS ===
    ai: {
        apiKey: '',
        model: 'gemini-2.5-flash-lite-preview-09-2025',
        customPrompt: '',
        outputLanguage: 'en',
        temperature: 0.7,
        maxTokens: 8192
    },

    // === AUTOMATION ===
    automation: {
        autoAnalyze: false,
        autoLike: false,
        autoLikeThreshold: 50,
        likeIfNotSubscribed: false,
        autoLikeLive: false
    },

    // === SEGMENTS ===
    segments: {
        enabled: true,
        categories: {
            sponsor: { action: 'skip', speed: 2 },
            intro: { action: 'speed', speed: 2 },
            outro: { action: 'speed', speed: 2 },
            interaction: { action: 'skip', speed: 2 },
            selfpromo: { action: 'skip', speed: 2 },
            music_offtopic: { action: 'ignore', speed: 2 },
            preview: { action: 'ignore', speed: 2 },
            filler: { action: 'speed', speed: 2 }
        }
    },

    // === EXTERNAL APIS ===
    externalApis: {
        tmdb: '',
        newsData: '',
        googleFactCheck: '',
        twitchClientId: '',
        twitchAccessToken: ''
    },

    // === ADVANCED ===
    advanced: {
        debugMode: false,
        saveHistory: true,
        maxHistoryItems: 100,
        enableTelemetry: false
    },

    // === INTERNAL ===
    _meta: {
        version: '1.0.0',
        lastUpdated: Date.now(),
        onboardingCompleted: false
    }
};

export class ConfigManager {
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.listeners = [];
    }

    async load() {
        const stored = await chrome.storage.sync.get('config');
        if (stored.config) {
            this.config = this.merge(DEFAULT_CONFIG, stored.config);
        }
        return this.config;
    }

    async save() {
        this.config._meta.lastUpdated = Date.now();
        await chrome.storage.sync.set({ config: this.config });
        this.notify();
    }

    get(path) {
        if (!path) return this.config;
        return path.split('.').reduce((obj, key) => obj?.[key], this.config);
    }

    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        target[last] = value;
    }

    async update(path, value) {
        this.set(path, value);
        await this.save();
    }

    async reset() {
        this.config = { ...DEFAULT_CONFIG };
        await this.save();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.config));
    }

    merge(defaults, stored) {
        const result = { ...defaults };
        for (const key in stored) {
            if (typeof stored[key] === 'object' && !Array.isArray(stored[key])) {
                result[key] = this.merge(defaults[key] || {}, stored[key]);
            } else {
                result[key] = stored[key];
            }
        }
        return result;
    }

    export() {
        return JSON.stringify(this.config, null, 2);
    }

    async import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.config = this.merge(DEFAULT_CONFIG, imported);
            await this.save();
            return true;
        } catch (e) {
            console.error('[Config] Import failed:', e);
            return false;
        }
    }
}

// Singleton
let instance = null;
export function getConfig() {
    if (!instance) instance = new ConfigManager();
    return instance;
}
