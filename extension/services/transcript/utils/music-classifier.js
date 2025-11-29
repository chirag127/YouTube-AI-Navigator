import { GeminiClient } from '../../../api/gemini-client.js';
import { sg, cw, sw, rp, tr, lc } from '../../../utils/shortcuts.js';

export async function isMusicVideo(t, c) {
  try {
    const s = await sg(['apiKey', 'model']);
    if (!s.apiKey) return false;
    const cl = new GeminiClient(s.apiKey);
    let m = s.model || 'gemini-2.5-flash-preview-09-2025';
    if (sw(m, 'models/')) m = rp(m, 'models/', '');
    const p = `Analyze this YouTube video metadata:\nTitle: "${t}"\nChannel: "${c}"\nIs this a music video (official music video, lyric video, or audio track)?\nReturn ONLY "true" or "false".`;
    const r = await cl.generateContent(p, m);
    return lc(tr(r)) === 'true';
  } catch (e) {
    cw('[MusicClassifier] Failed to classify:', e);
    return false;
  }
}
