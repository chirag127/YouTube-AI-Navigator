export class GeneralSettings {
    constructor(settingsManager, autoSave) {
        this.settings = settingsManager;
        this.autoSave = autoSave;
    }

    init() {
        this.loadSettings();
        this.attachListeners();
    }

    loadSettings() {
        const config = this.settings.get();

        // Language
        this.setValue('outputLanguage', config.ai?.outputLanguage || 'en');
        this.setValue('transcriptLanguage', config.transcript?.language || 'en');

        // Transcript
        this.setValue('transcriptMethod', config.transcript?.method || 'auto');
        this.setChecked('transcriptAutoClose', config.transcript?.autoClose ?? true);
        this.setValue('transcriptAutoCloseDelay', config.transcript?.autoCloseDelay || 1000);
        this.setChecked('transcriptAutoCloseOnCached', config.transcript?.autoCloseOnCached ?? false);
        this.setChecked('includeTimestamps', config.transcript?.includeTimestamps ?? true);

        // Cache
        this.setChecked('cacheEnabled', config.cache?.enabled ?? true);
        this.setValue('cacheTTL', (config.cache?.ttl || 86400000) / 3600000);
        this.setChecked('cacheTranscripts', config.cache?.transcripts ?? true);
        this.setChecked('cacheComments', config.cache?.comments ?? true);
        this.setChecked('cacheMetadata', config.cache?.metadata ?? true);

        // Scroll
        this.setChecked('autoScrollToComments', config.scroll?.autoScrollToComments ?? false);
        this.setChecked('scrollBackAfterComments', config.scroll?.scrollBackAfterComments ?? true);
        this.setChecked('showScrollNotification', config.scroll?.showScrollNotification ?? true);

        // Comments
        this.setChecked('commentsEnabled', config.comments?.enabled ?? true);
        this.setValue('commentsLimit', config.comments?.limit || 20);
        this.setChecked('analyzeSentiment', config.comments?.analyzeSentiment ?? true);

        // Metadata
        this.setChecked('includeTitle', config.metadata?.includeTitle ?? true);
        this.setChecked('includeAuthor', config.metadata?.includeAuthor ?? true);
        this.setChecked('includeViews', config.metadata?.includeViews ?? true);
        this.setChecked('includeDuration', config.metadata?.includeDuration ?? true);
        this.setChecked('includeDescription', config.metadata?.includeDescription ?? true);
        this.setChecked('includeTags', config.metadata?.includeTags ?? true);

        // Automation
        this.setChecked('autoAnalyze', config.automation?.autoAnalyze ?? false);

        // Data & Privacy
        this.setChecked('saveHistory', config.advanced?.saveHistory ?? true);
    }

    attachListeners() {
        this.autoSave.attachToAll({
            outputLanguage: { path: 'ai.outputLanguage' },
            transcriptLanguage: { path: 'transcript.language' },
            transcriptMethod: { path: 'transcript.method' },
            transcriptAutoClose: { path: 'transcript.autoClose' },
            transcriptAutoCloseDelay: { path: 'transcript.autoCloseDelay', transform: (v) => parseInt(v) },
            transcriptAutoCloseOnCached: { path: 'transcript.autoCloseOnCached' },
            includeTimestamps: { path: 'transcript.includeTimestamps' },
            cacheEnabled: { path: 'cache.enabled' },
            cacheTTL: { path: 'cache.ttl', transform: (v) => parseInt(v) * 3600000 },
            cacheTranscripts: { path: 'cache.transcripts' },
            cacheComments: { path: 'cache.comments' },
            cacheMetadata: { path: 'cache.metadata' },
            autoScrollToComments: { path: 'scroll.autoScrollToComments' },
            scrollBackAfterComments: { path: 'scroll.scrollBackAfterComments' },
            showScrollNotification: { path: 'scroll.showScrollNotification' },
            commentsEnabled: { path: 'comments.enabled' },
            commentsLimit: { path: 'comments.limit', transform: (v) => parseInt(v) },
            analyzeSentiment: { path: 'comments.analyzeSentiment' },
            includeTitle: { path: 'metadata.includeTitle' },
            includeAuthor: { path: 'metadata.includeAuthor' },
            includeViews: { path: 'metadata.includeViews' },
            includeDuration: { path: 'metadata.includeDuration' },
            includeDescription: { path: 'metadata.includeDescription' },
            includeTags: { path: 'metadata.includeTags' },
            autoAnalyze: { path: 'automation.autoAnalyze' },
            saveHistory: { path: 'advanced.saveHistory' }
        });

        // Clear History
        document.getElementById('clearHistory')?.addEventListener('click', async () => {
            if (confirm('Clear all history? This cannot be undone.')) {
                await chrome.storage.local.remove('comprehensive_history');
                this.autoSave.show('✓ History cleared');
                setTimeout(() => this.autoSave.hide(), 2000);
            }
        });
    }

    setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }

    setChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = checked;
    }
}
