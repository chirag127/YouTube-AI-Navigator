import { geniusLyricsAPI as geniusAPI } from '../../api/genius-lyrics.js';

export async function handleGetLyrics(req, rsp) {
  try {
    const { title, artist } = req;
    const res = await geniusAPI.getLyrics(title, artist);
    rsp({ success: true, result: res });
  } catch (x) {
    console.error('[GetLyrics] Error:', x);
    rsp({ success: false, error: x.message });
  }
}
