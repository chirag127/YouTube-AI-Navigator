import { ge, $$, on, sg, ss, nt, js, jp, ft, tab as ctab } from '../utils/shortcuts.js';
class OnboardingFlow {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.settings = {};
        this.init();
    }
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
    }
    async loadSettings() {
        const result = await sg('config');
        this.settings = result.config || this.getDefaults();
    }
    async saveSettings(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => {
            obj[key] = obj[key] || {};
            return obj[key];
        }, this.settings);
        target[last] = value;
        await ss('config', this.settings);
    }
    getDefaults() {
        return {
            ai: { apiKey: '', model: 'gemini-2.5-flash-lite-preview-09-2025' },
            automation: { autoAnalyze: true },
            segments: { enabled: true },
            ui: { outputLanguage: 'en' },
            _meta: { onboardingCompleted: false, version: '1.0.0', lastUpdated: nt() }
        };
    }
    setupEventListeners() {
        on(ge('nextBtn'), 'click', () => this.nextStep());
        on(ge('backBtn'), 'click', () => this.prevStep());
        ge('toggleApiKeyBtn') && on(ge('toggleApiKeyBtn'), 'click', this.toggleApiKeyVisibility.bind(this));
        ge('testApiKeyBtn') && on(ge('testApiKeyBtn'), 'click', this.testApiKey.bind(this));
        ge('apiKeyInput') && on(ge('apiKeyInput'), 'input', this.onApiKeyInput.bind(this));
        ge('openApiKeyPage') && on(ge('openApiKeyPage'), 'click', () => {
            ctab({ url: 'https://aistudio.google.com/app/apikey' });
        });
        ge('outputLanguage') && on(ge('outputLanguage'), 'change', e => {
            this.saveSettings('ui.outputLanguage', e.target.value);
        });
        ge('autoAnalyze') && on(ge('autoAnalyze'), 'change', e => {
            this.saveSettings('automation.autoAnalyze', e.target.checked);
        });
        ge('enableSegments') && on(ge('enableSegments'), 'change', e => {
            this.saveSettings('segments.enabled', e.target.checked);
        });
        ge('openSettingsBtn') && on(ge('openSettingsBtn'), 'click', () => {
            chrome.runtime.openOptionsPage();
            window.close();
        });
        ge('finishBtn') && on(ge('finishBtn'), 'click', () => this.completeOnboarding());
    }
    toggleApiKeyVisibility() {
        const input = ge('apiKeyInput');
        input.type = input.type === 'password' ? 'text' : 'password';
    }
    onApiKeyInput() {
        const status = ge('apiKeyStatus');
        status.className = 'status-message';
        status.textContent = '';
    }
    async testApiKey() {
        const input = ge('apiKeyInput');
        const btn = ge('testApiKeyBtn');
        const status = ge('apiKeyStatus');
        const apiKey = input.value.trim();
        if (!apiKey) {
            status.className = 'status-message error';
            status.textContent = 'Please enter an API key';
            return;
        }
        btn.disabled = true;
        btn.textContent = 'Testing...';
        status.className = 'status-message loading';
        status.textContent = 'Connecting to Google AI...';
        try {
            const modelName = 'gemini-2.5-pro';
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: js({ contents: [{ parts: [{ text: 'Hello' }] }] }),
                }
            );
            if (!response.ok) {
                let errorMessage = 'Invalid API key or connection failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    errorMessage = `Connection failed (${response.status}: ${response.statusText})`;
                }
                throw new Error(errorMessage);
            }
            await this.saveSettings('ai.apiKey', apiKey);
            status.className = 'status-message success';
            status.textContent = '✓ Connection successful! API key saved.';
            setTimeout(() => this.nextStep(), 1500);
        } catch (error) {
            status.className = 'status-message error';
            status.textContent = `✗ ${error.message}`;
        } finally {
            btn.disabled = false;
            btn.textContent = 'Test Connection';
        }
    }
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateUI();
        }
    }
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateUI();
        }
    }
    updateUI() {
        const steps = $$('.step');
        const dots = $$('.step-dot');
        const progressFill = ge('progressFill');
        const backBtn = ge('backBtn');
        const nextBtn = ge('nextBtn');
        steps.forEach((step, index) => {
            step.classList.remove('active', 'prev');
            if (index === this.currentStep) {
                step.classList.add('active');
            } else if (index < this.currentStep) {
                step.classList.add('prev');
            }
        });
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index === this.currentStep) {
                dot.classList.add('active');
            } else if (index < this.currentStep) {
                dot.classList.add('completed');
            }
        });
        const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
        progressFill.style.width = `${progress}%`;
        backBtn.disabled = this.currentStep === 0;
        if (this.currentStep === this.totalSteps - 1) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
        }
        this.loadStepData();
    }
    async loadStepData() {
        if (this.currentStep === 1) {
            const input = ge('apiKeyInput');
            if (this.settings.ai?.apiKey) {
                input.value = this.settings.ai.apiKey;
            }
        } else if (this.currentStep === 2) {
            ge('outputLanguage').value = this.settings.ui?.outputLanguage || 'en';
            ge('autoAnalyze').checked = this.settings.automation?.autoAnalyze || false;
            ge('enableSegments').checked = this.settings.segments?.enabled !== false;
        }
    }
    async completeOnboarding() {
        await this.saveSettings('_meta.onboardingCompleted', true);
        window.close();
    }
}
on(document, 'DOMContentLoaded', () => {
    new OnboardingFlow();
});
