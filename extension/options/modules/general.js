export class GeneralSettings {
    constructor(settingsManager, uiManager) {
        this.settings = settingsManager;
        this.ui = uiManager;
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
        this.setValue('cacheTTL', (config.cache?.ttl || 86400000) / 3600000); // Convert ms to hours
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
        // Language
        this.onChange('outputLanguage', (v) => this.settings.update('ai.outputLanguage', v));
        this.onChange('transcriptLanguage', (v) => this.settings.update('transcript.language', v));

        // Transcript
        this.onChange('transcriptMethod', (v) => this.settings.update('transcript.method', v));
        this.onChange('transcriptAutoClose', (v) => this.settings.update('transcript.autoClose', v));
        this.onChange('transcriptAutoCloseDelay', (v) => this.settings.update('transcript.autoCloseDelay', parseInt(v)));
        this.onChange('transcriptAutoCloseOnCached', (v) => this.settings.update('transcript.autoCloseOnCached', v));
        this.onChange('includeTimestamps', (v) => this.settings.update('transcript.includeTimestamps', v));

        // Cache
        this.onChange('cacheEnabled', (v) => this.settings.update('cache.enabled', v));
        this.onChange('cacheTTL', (v) => this.settings.update('cache.ttl', parseInt(v) * 3600000)); // Convert hours to ms
        this.onChange('cacheTranscripts', (v) => this.settings.update('cache.transcripts', v));
        this.onChange('cacheComments', (v) => this.settings.update('cache.comments', v));
        this.onChange('cacheMetadata', (v) => this.settings.update('cache.metadata', v));

        // Scroll
        this.onChange('autoScrollToComments', (v) => this.settings.update('scroll.autoScrollToComments', v));
        this.onChange('scrollBackAfterComments', (v) => this.settings.update('scroll.scrollBackAfterComments', v));
        this.onChange('showScrollNotification', (v) => this.settings.update('scroll.showScrollNotification', v));

        // Comments
        this.onChange('commentsEnabled', (v) => this.settings.update('comments.enabled', v));
        this.onChange('commentsLimit', (v) => this.settings.update('comments.limit', parseInt(v)));
        this.onChange('analyzeSentiment', (v) => this.settings.update('comments.analyzeSentiment', v));

        // Metadata
        this.onChange('includeTitle', (v) => this.settings.update('metadata.includeTitle', v));
        this.onChange('includeAuthor', (v) => this.settings.update('metadata.includeAuthor', v));
        this.onChange('includeViews', (v) => this.settings.update('metadata.includeViews', v));
        this.onChange('includeDuration', (v) => this.settings.update('metadata.includeDuration', v));
        this.onChange('includeDescription', (v) => this.settings.update('metadata.includeDescription', v));
        this.onChange('includeTags', (v) => this.settings.update('metadata.includeTags', v));

        // Automation
        this.onChange('autoAnalyze', (v) => this.settings.update('automation.autoAnalyze', v));

        // Data & Privacy
        this.onChange('saveHistory', (v) => this.settings.update('advanced.saveHistory', v));

        // Clear History
        document.getElementById('clearHistory')?.addEventListener('click', async () => {
            if (confirm('Clear all history? This cannot be undone.')) {
                await chrome.storage.local.remove('history');
                this.ui.showToast('History cleared');
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

    onChange(id, callback) {
        const el = document.getElementById(id);
        if (!el) return;

        const handler = (e) => {
            const value = el.type === 'checkbox' ? el.checked : el.value;
            callback(value);
        };

        el.addEventListener('change', handler);
        el.addEventListener('input', handler);
    }
}
