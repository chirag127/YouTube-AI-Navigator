export class ModelManager {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.models = [];
    }

    async fetch() {
        if (!this.apiKey) return;
        try {
            const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
            const data = await response.json();
            if (data.models) {
                this.models = data.models
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
            }
        } catch (e) {
            console.warn('Failed to fetch Gemini models:', e);
            this.models = [];
        }
        return this.models;
    }

    getList() {
        // Prioritize specific models if available
        const priority = [
            'gemini-2.5-flash-lite-preview-09-2025',
            'gemini-2.5-flash-lite',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];

        const sorted = [...this.models].sort((a, b) => {
            const indexA = priority.indexOf(a);
            const indexB = priority.indexOf(b);
            if (indexA > -1 && indexB > -1) return indexA - indexB;
            if (indexA > -1) return -1;
            if (indexB > -1) return 1;
            return a.localeCompare(b);
        });

        return sorted.length ? sorted : priority;
    }
}
