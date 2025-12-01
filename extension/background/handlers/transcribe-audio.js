import { GeminiClient } from '../../api/gemini-client.js';

export async function handleTranscribeAudio(req, rsp) {
  try {
    const { audioUrl, lang } = req;
    if (!audioUrl) throw new Error('No audio URL provided');
    const s = await chrome.storage.sync.get(['apiKey', 'model']);
    if (!s.apiKey) throw new Error('Gemini API key not found');
    let m = s.model || 'gemini-2.5-flash-lite-preview-09-2025';
    if (m.startsWith('models/')) m = m.replace('models/', '');
    const c = new GeminiClient(s.apiKey);
    const ar = await fetch(audioUrl);
    if (!ar.ok) throw new Error(`Failed to fetch audio: ${ar.status}`);
    const ab = await ar.arrayBuffer();
    const b64 = btoa(new Uint8Array(ab).reduce((d, b) => d + String.fromCharCode(b), ''));
    const pt = `Transcribe the following audio into a JSON array of segments. Language: ${lang || 'en'}. Format: JSON only. No markdown. Structure: [{"start": number (seconds), "text": "string", "category": "Content" | "Sponsor" | "SelfPromo" | "Intro" | "Outro"}]. If the audio is music or no speech, return [].`;
    const parts = [{ inlineData: { mimeType: 'audio/mp4', data: b64 } }, { text: pt }];
    const txt = await c.generateContent(parts, m);
    let seg = [];
    try {
      const cln = txt.replace(/```json/g, '').replace(/```/g, '').trim();
      seg = JSON.parse(cln);
    } catch (x) {
      console.warn('[TranscribeAudio] JSON parse failed, trying to extract array', x);
      const m = txt.match(/\[.*\]/s);
      if (m) seg = JSON.parse(m[0]);
      else throw new Error('Failed to parse transcription response');
    }
    rsp({ success: true, segments: seg });
  } catch (x) {
    console.error('[TranscribeAudio] Error:', x);
    rsp({ success: false, error: x.message });
  }
}
