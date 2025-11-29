import { l, cw, rt } from '../../../utils/shortcuts.js';
const getAudioUrl = () => {
  try {
    const pr = window.ytInitialPlayerResponse;
    if (!pr?.streamingData?.adaptiveFormats) return null;
    const formats = pr.streamingData.adaptiveFormats;
    const audioFormat = formats.find(
      f => f.mimeType.includes('audio/mp4') || f.mimeType.includes('audio/webm')
    );
    return audioFormat?.url || null;
  } catch (e) {
    cw('[SpeechToText] Failed to extract audio URL:', e);
    return null;
  }
};
async function fetchViaSpeechToText(videoId, lang = 'en') {
  l(`[SpeechToText] Starting extraction for ${videoId}, lang: ${lang}`);
  const audioUrl = getAudioUrl();
  if (!audioUrl) {
    cw('[SpeechToText] No audio URL found');
    return null;
  }
  l('[SpeechToText] Found audio URL, requesting transcription...');
  return new Promise(resolve => {
    rt.sendMessage({ type: 'TRANSCRIBE_AUDIO', audioUrl, lang }, response => {
      if (rt.lastError) {
        cw('[SpeechToText] Message error:', rt.lastError);
        resolve(null);
        return;
      }
      if (response?.success && response.segments) {
        l(`[SpeechToText] ✅ Success: ${response.segments.length} segments`);
        resolve(response.segments);
      } else {
        cw('[SpeechToText] Failed:', response?.error);
        resolve(null);
      }
    });
  });
}
export const strategy = {
  name: 'Speech to Text (Gemini)',
  priority: 8,
  fetch: fetchViaSpeechToText,
};
