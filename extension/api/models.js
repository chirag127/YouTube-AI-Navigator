




export class ModelManager {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.models = [];
  }
  async fetch() {
    if (!this.apiKey) return;
    try {
      const data = await (await fetch(`${this.baseUrl}/models?key=${this.apiKey}`)).json();
      if (data?.models)
        this.models = data.models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name.replace('models/', ''));
    } catch (e) {
      console.warn('Mod fetch fail:', e);
      this.models = [];
    }
    return this.models;
  }
  getList() {
    const p = [
      'gemini-2.5-flash-lite-preview-09-2025',
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash-preview-09-2025',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-001',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-001',
    ];
    const s = [...this.models].sort((a, b) => {
      const ia = p.indexOf(a),
        ib = p.indexOf(b);
      if (ia > -1 && ib > -1) return ia - ib;
      if (ia > -1) return -1;
      if (ib > -1) return 1;
      return a.localeCompare(b);
    });
    return s.length ? s : p;
  }
}
