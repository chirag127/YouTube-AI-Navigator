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
        const result = await chrome.storage.sync.get(null);
        this.settings = result || {};
    }

    async saveSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        await chrome.storage.sync.set(updates);
    }

    setupEventListeners() {
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('backBtn').addEventListener('click', () => this.prevStep());

        // Step 1: API Key
        document.getElementById('toggleApiKeyBtn')?.addEventListener('click', this.toggleApiKeyVisibility.bind(this));
        document.getElementById('testApiKeyBtn')?.addEventListener('click', this.testApiKey.bind(this));
        document.getElementById('apiKeyInput')?.addEventListener('input', this.onApiKeyInput.bind(this));
        document.getElementById('openApiKeyPage')?.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://aistudio.google.com/app/apikey' });
        });

        // Step 2: Configuration
        document.getElementById('outputLanguage')?.addEventListener('change', (e) => {
            this.saveSettings({ outputLanguage: e.target.value });
        });
        document.getElementById('autoAnalyze')?.addEventListener('change', (e) => {
            this.saveSettings({ autoAnalyze: e.target.checked });
        });
        document.getElementById('enableSegments')?.addEventListener('change', (e) => {
            this.saveSettings({ enableSegments: e.target.checked });
        });

        // Step 3: Final actions
        document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
            window.close();
        });
        document.getElementById('finishBtn')?.addEventListener('click', () => this.completeOnboarding());
    }

    toggleApiKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        input.type = input.type === 'password' ? 'text' : 'password';
    }

    onApiKeyInput(e) {
        const status = document.getElementById('apiKeyStatus');
        status.className = 'status-message';
        status.textContent = '';
    }

    async testApiKey() {
        const input = document.getElementById('apiKeyInput');
        const btn = document.getElementById('testApiKeyBtn');
        const status = document.getElementById('apiKeyStatus');
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
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Hello' }] }]
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Invalid API key');
            }

            await this.saveSettings({ apiKey });
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
        const steps = document.querySelectorAll('.step');
        const dots = document.querySelectorAll('.step-dot');
        const progressFill = document.getElementById('progressFill');
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');

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
            const input = document.getElementById('apiKeyInput');
            if (this.settings.apiKey) {
                input.value = this.settings.apiKey;
            }
        } else if (this.currentStep === 2) {
            document.getElementById('outputLanguage').value = this.settings.outputLanguage || 'en';
            document.getElementById('autoAnalyze').checked = this.settings.autoAnalyze || false;
            document.getElementById('enableSegments').checked = this.settings.enableSegments !== false;
        }
    }

    async completeOnboarding() {
        await this.saveSettings({ onboardingCompleted: true });
        window.close();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OnboardingFlow();
});
