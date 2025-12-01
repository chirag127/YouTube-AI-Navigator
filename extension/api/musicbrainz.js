const BASE_URL = 'https://musicbrainz.org/ws/2';
const UA = 'YouTubeAINavigator/1.0.0 ( contact@example.com )';

export class MusicBrainzAPI {
  async searchArtist(query) {
    console.log(`[MusicBrainz] Searching artist: ${query}`);
    const cfg = await chrome.storage.sync.get('integrations');
    if (cfg.integrations?.musicbrainz?.enabled === false) {
      console.log(`[MusicBrainz] Disabled in config`);
      return null;
    }

    try {
      const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'YouTubeAI/1.0' } });
      if (!res.ok) {
        console.error(`[MusicBrainz:Fail] Artist search failed: ${res.status} ${res.statusText}`);
        return null;
      }
      const data = await res.json();
      const result = data?.artists?.[0] || null;
      console.log(`[MusicBrainz] Artist search ${result ? 'success' : 'no results'}`);
      return result;
    } catch (error) {
      console.error(`[MusicBrainz:Fail] Artist search error:`, error.message);
      return null;
    }
  }
  async searchRelease(query, artist) {
    const q = artist ? `${query} AND artist:${artist}` : query;
    console.log(`[MusicBrainz] Searching release: ${q}`);

    try {
      const response = await fetch(`${BASE_URL}/release?query=${encodeURIComponent(q)}&fmt=json`, {
        headers: { 'User-Agent': UA },
      });
      const data = await response.json();
      const result = data?.releases?.[0] || null;
      console.log(`[MusicBrainz] Release search ${result ? 'success' : 'no results'}`);
      return result;
    } catch (error) {
      console.error(`[MusicBrainz:Fail] Release search error:`, error.message);
      return null;
    }
  }
}
