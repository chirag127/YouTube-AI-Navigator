

import { nw as nt, js } from '../utils/shortcuts/core.js';





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
    try {
      const r = await chrome.storage.sync.get('config');
      this.settings = r.config || this.getDefaults();
    } catch (err) {
      console.error('Err:LoadSettings', err);
    }
  }
  async saveSettings(p, v) {
    try {
      const k = p.split('.'),
        last = k.pop(),
        t = k.reduce((o, key) => {
          o[key] = o[key] || {};
          return o[key];
        }, this.settings);
      t[last] = v;
      await chrome.storage.sync.set(typeof 'config' === 'string' ? { ['config']: this.settings } : 'config');
    } catch (err) {
      console.error('Err:SaveSettings', err);
    }
  }
  getDefaults() {
    const defaults = {
      ai: { GAK: '', model: 'gemini-2.5-flash-lite-preview-09-2025' },
      automation: { autoAnalyze: true },
      segments: { enabled: true },
      ui: { outputLanguage: 'en' },
      _meta: { onboardingCompleted: false, version: '1.0.0', lastUpdated: nt() },
    };
    return defaults;
  }
  setupEventListeners() {
    (document.getElementById('nextBtn'))?.addEventListener('click', () => this.nextStep());
    (document.getElementById('backBtn'))?.addEventListener('click', () => this.prevStep());
    const tak = document.getElementById('toggleApiKeyBtn'),
      tst = document.getElementById('testApiKeyBtn'),
      aki = document.getElementById('apiKeyInput'),
      oak = document.getElementById('openApiKeyPage'),
      ol = document.getElementById('outputLanguage'),
      aa = document.getElementById('autoAnalyze'),
      es = document.getElementById('enableSegments'),
      os = document.getElementById('openSettingsBtn'),
      fb = document.getElementById('finishBtn');
    if (tak) (tak)?.addEventListener('click', this.toggleApiKeyVisibility.bind(this));
    if (tst) (tst)?.addEventListener('click', this.testApiKey.bind(this));
    if (aki) (aki)?.addEventListener('input', this.onApiKeyInput.bind(this));
    if (oak) (oak)?.addEventListener('click', () => chrome.tabs({ url: 'https://aistudio.google.com/app/apikey' }));
    if (ol) (ol)?.addEventListener('change', e => this.saveSettings('ui.outputLanguage', e.target.value));
    if (aa) (aa)?.addEventListener('change', e => this.saveSettings('automation.autoAnalyze', e.target.checked));
    if (es) (es)?.addEventListener('change', e => this.saveSettings('segments.enabled', e.target.checked));
    if (os)
      (os)?.addEventListener('click', () => {
        rt.openOptionsPage();
        chrome.windows.close();
      });
    if (fb) (fb)?.addEventListener('click', () => this.completeOnboarding());
  }
  toggleApiKeyVisibility() {
    const i = document.getElementById('apiKeyInput');
    i.type = i.type === 'password' ? 'text' : 'password';
  }
  onApiKeyInput() {
    const s = document.getElementById('apiKeyStatus');
    s.className = 'status-message';
    s.textContent = '';
  }
  async testApiKey() {
    const i = document.getElementById('apiKeyInput'),
      b = document.getElementById('testApiKeyBtn'),
      s = document.getElementById('apiKeyStatus'),
      k = i.value.trim();
    if (!k) {
      s.className = 'status-message error';
      s.textContent = 'Please enter an API key';
      return;
    }
    b.disabled = true;
    b.textContent = 'Testing...';
    s.className = 'status-message loading';
    s.textContent = 'Connecting to Google AI...';
    try {
      const m = 'gemini-2.5-pro';
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: js({ contents: [{ parts: [{ text: 'Hello' }] }] }),
        }
      );
      if (!r.ok) {
        let em = 'Invalid API key or connection failed';
        try {
          const ed = await r.json();
          em = ed.error?.message || em;
        } catch (e) {
          em = `Connection failed(${r.status}: ${r.statusText})`;
        }
        throw new Error(em);
      }
      await this.saveSettings('ai.GAK', k);
      await sls('GAK', k);
      s.className = 'status-message success';
      s.textContent = '✓ Connection successful! API key saved.';
      setTimeout(() => this.nextStep(), 1500);
    } catch (e) {
      console.error('Err:TestApiKey', e);
      s.className = 'status-message error';
      s.textContent = `✗ ${e.message}`;
    } finally {
      b.disabled = false;
      b.textContent = 'Test Connection';
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
    const s = [...$$('.step')],
      d = [...$$('.step-dot')],
      pf = document.getElementById('progressFill'),
      bb = document.getElementById('backBtn'),
      nb = document.getElementById('nextBtn');
    s.forEach((st, i) => {
      st.classList.remove('active', 'prev');
      if (i === this.currentStep) st.classList.add('active');
      else if (i < this.currentStep) st.classList.add('prev');
    });
    d.forEach((dt, i) => {
      dt.classList.remove('active', 'completed');
      if (i === this.currentStep) dt.classList.add('active');
      else if (i < this.currentStep) dt.classList.add('completed');
    });
    pf.style.width = `${((this.currentStep + 1) / this.totalSteps) * 100}% `;
    bb.disabled = this.currentStep === 0;
    nb.style.display = this.currentStep === this.totalSteps - 1 ? 'none' : 'block';
    this.loadStepData();
  }
  async loadStepData() {
    if (this.currentStep === 1) {
      const i = document.getElementById('apiKeyInput');
      if (this.settings.ai?.GAK) i.value = this.settings.ai.GAK;
    } else if (this.currentStep === 2) {
      document.getElementById('outputLanguage').value = this.settings.ui?.outputLanguage || 'en';
      document.getElementById('autoAnalyze').checked = this.settings.automation?.autoAnalyze || false;
      document.getElementById('enableSegments').checked = this.settings.segments?.enabled !== false;
    }
  }
  async completeOnboarding() {
    try {
      await this.saveSettings('_meta.onboardingCompleted', true);
      chrome.windows.close();
    } catch (err) {
      console.error('Err:CompleteOnboarding', err);
    }
  }
}
(document)?.addEventListener('DOMContentLoaded', () => new OnboardingFlow());
