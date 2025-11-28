export class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    }

    async call(prompt, model) {
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || response.statusText);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    async callStream(prompt, model, onChunk) {
        const url = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || response.statusText);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Process all complete lines, keep the last one in buffer if it's incomplete
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim().startsWith('data:')) {
                    const jsonStr = line.substring(line.indexOf('data:') + 5).trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (textChunk) {
                            fullText += textChunk;
                            if (onChunk) onChunk(textChunk, fullText);
                        }
                    } catch (e) {
                        console.warn('Failed to parse SSE chunk:', e);
                        // If it fails, it might be a partial JSON, but we are splitting by line
                        // which usually works for SSE. If Gemini sends multi-line JSON in one SSE event,
                        // this simple parser might need adjustment, but usually 'data:' is one line.
                    }
                } else if (line.trim().startsWith('[')) {
                    // Sometimes the very first or last chunk might be a raw JSON array start/end depending on API version
                    // But standard SSE from Gemini follows data: prefix.
                }
            }
        }

        return fullText;
    }
}
