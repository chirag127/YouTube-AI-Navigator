export class GeminiAPI {
    constructor(k) { this.apiKey = k; this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta' }
    async call(p, m) {
        if (!this.apiKey) throw new Error('API Key required');

        const n = m.startsWith('models/') ? m.replace('models/', '') : m;
        const u = `${this.baseUrl}/models/${n}:generateContent?key=${this.apiKey}`;

        try {
            const r = await fetch(u, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: p }] }] })
            });

            if (!r.ok) {
                const t = await r.text();
                let e = r.statusText;
                try {
                    const d = JSON.parse(t);
                    e = d.error?.message || e;
                } catch (x) { }
                throw new Error(`Gemini API Error (${r.status}): ${e}`);
            }

            const t = await r.text();
            try {
                const d = JSON.parse(t);
                const g = d.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!g) throw new Error('No content generated');
                return g;
            } catch (e) {
                throw new Error(`Failed to parse response: ${e.message}`);
            }
        } catch (e) {
            if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
                throw new Error(`Network error calling model ${n}: ${e.message}`);
            }
            throw e;
        }
    }
}
