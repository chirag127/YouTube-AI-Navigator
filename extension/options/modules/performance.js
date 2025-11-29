export class PerformanceSettings {
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
        const perf = config.performance || {};

        this.setValue('maxConcurrentRequests', perf.maxConcurrentRequests || 3);
        this.setValue('rateLimitDelay', perf.rateLimitDelay || 1000);
        this.setValue('retryAttempts', perf.retryAttempts || 3);
        this.setValue('retryDelay', perf.retryDelay || 2000);
    }

    attachListeners() {
        this.autoSave.attachToAll({
            maxConcurrentRequests: {
                path: 'performance.maxConcurrentRequests',
                transform: (v) => parseInt(v)
            },
            rateLimitDelay: {
                path: 'performance.rateLimitDelay',
                transform: (v) => parseInt(v)
            },
            retryAttempts: {
                path: 'performance.retryAttempts',
                transform: (v) => parseInt(v)
            },
            retryDelay: {
                path: 'performance.retryDelay',
                transform: (v) => parseInt(v)
            }
        });
    }

    setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }
}
