import { sg, l, w } from '../../utils/shortcuts.js';
import { strategy as domAutomationStrategy } from './strategies/dom-automation-strategy.js';
import { strategy as invidiousStrategy } from './strategies/invidious-strategy.js';
import { strategy as speechToTextStrategy } from './strategies/speech-to-text-strategy.js';
import { strategy as geniusStrategy } from './strategies/genius-strategy.js';
const STRATEGIES = [
    domAutomationStrategy,
    invidiousStrategy,
    geniusStrategy,
    speechToTextStrategy,
].sort((a, b) => a.priority - b.priority);
export async function fetchTranscript(videoId, lang = 'en', timeout = 30000) {
    let lastError;
    const stored = await sg(['transcriptMethod', 'transcriptLanguage']);
    const preferredMethod = stored.transcriptMethod || 'auto';
    const preferredLang = stored.transcriptLanguage || lang;
    l(`[Fetcher] Settings - Method: ${preferredMethod}, Language: ${preferredLang}`);
    let strategiesToTry = [...STRATEGIES];
    if (preferredMethod !== 'auto') {
        const preferredStrategy = strategiesToTry.find(s => {
            if (preferredMethod === 'dom-automation') return s.name === 'DOM Automation';
            if (preferredMethod === 'invidious') return s.name === 'Invidious API';
            if (preferredMethod === 'genius') return s.name === 'Genius Lyrics';
            return false;
        });
        if (preferredStrategy) {
            strategiesToTry = strategiesToTry.filter(s => s !== preferredStrategy);
            strategiesToTry.unshift(preferredStrategy);
        }
    }
    for (const strategy of strategiesToTry) {
        try {
            l(`[Fetcher] Trying ${strategy.name}...`);
            const promise = strategy.fetch(videoId, preferredLang);
            const result = await Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
            ]);
            if (result?.length) {
                l(`[Fetcher] ✅ ${strategy.name} succeeded: ${result.length} segments`);
                return result;
            }
        } catch (e) {
            lastError = e;
            w(`[Fetcher] ${strategy.name} failed:`, e.message);
        }
    }
    throw new Error(lastError?.message || 'All transcript fetch strategies failed');
}
