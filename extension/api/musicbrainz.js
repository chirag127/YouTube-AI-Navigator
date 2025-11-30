import { en as enc } from '../utils/shortcuts/global.js';
import { sf as safeFetch } from '../utils/shortcuts/network.js';
import { sg } from '../utils/shortcuts/storage.js';
import { e, l } from '../utils/shortcuts/log.js';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const UA = 'YouTubeAINavigator/1.0.0 ( contact@example.com )';

export class MusicBrainzAPI {
  async searchArtist(query) {
    l(`[MusicBrainz] Searching artist: ${query}`);
    const cfg = await sg('integrations');
    if (cfg.integrations?.musicbrainz?.enabled === false) {
      l(`[MusicBrainz] Disabled in config`);
      return null;
    }

    try {
      const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'YouTubeAI/1.0' } });
      if (!res.ok) {
        e(`[MusicBrainz:Fail] Artist search failed: ${res.status} ${res.statusText}`);
        return null;
      }
      const data = await res.json();
      const result = data?.artists?.[0] || null;
      l(`[MusicBrainz] Artist search ${result ? 'success' : 'no results'}`);
      return result;
    } catch (error) {
      e(`[MusicBrainz:Fail] Artist search error:`, error.message);
      return null;
    }
  }
  async searchRelease(query, artist) {
    const q = artist ? `${query} AND artist:${artist}` : query;
    l(`[MusicBrainz] Searching release: ${q}`);

    try {
      const data = await safeFetch(`${BASE_URL}/release?query=${enc(q)}&fmt=json`, {
        headers: { 'User-Agent': UA },
      });
      const result = data?.releases?.[0] || null;
      l(`[MusicBrainz] Release search ${result ? 'success' : 'no results'}`);
      return result;
    } catch (error) {
      e(`[MusicBrainz:Fail] Release search error:`, error.message);
      return null;
    }
  }
}
