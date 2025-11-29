import { $, l, cw, rt } from '../../../utils/shortcuts.js';
import geniusAPI from '../../../api/genius-lyrics.js';
import { isMusicVideo } from '../utils/music-classifier.js';
async function fetchViaGenius(videoId, lang = 'en') {
  const title = $('h1.ytd-watch-metadata')?.textContent?.trim();
  const channel = $('.ytd-channel-name a')?.textContent?.trim();
  if (!title) {
    cw('[Genius Strategy] Could not find video title');
    return null;
  }
  l(`[Genius Strategy] Checking if music video: "${title}" by ${channel}`);
  const isMusic = await isMusicVideo(title, channel || '');
  if (!isMusic) {
    l('[Genius Strategy] Gemini determined this is NOT a music video. Skipping.');
    return null;
  }
  l('[Genius Strategy] Identified as Music Video. Fetching lyrics...');
  const result = await new Promise(resolve => {
    rt.sendMessage({ type: 'GET_LYRICS', title, artist: channel || '' }, response => {
      if (rt.lastError) {
        cw('[Genius Strategy] Message error:', rt.lastError);
        resolve(null);
        return;
      }
      resolve(response?.result);
    });
  });
  if (result && result.lyrics) {
    l(`[Genius Strategy] ✅ Found lyrics for: ${result.title}`);
    return [{ start: 0, duration: 0, text: result.lyrics }];
  }
  return null;
}
export const strategy = { name: 'Genius Lyrics', priority: 3, fetch: fetchViaGenius };
