export class GeniusLyricsAPI {
  constructor() {
    this.baseUrl = 'https://genius.com';
    this.searchUrl = 'https://genius.com/api/search/multi';
  }

  async getLyrics(title, artist) {
    try {
      const hit = await this.search(title, artist);
      if (!hit) {
        return null;
      }

      const lyrics = await this.fetchLyrics(hit.result.url);
      return {
        lyrics,
        source: 'Genius',
        url: hit.result.url,
        title: hit.result.title,
        artist: hit.result.primary_artist.name,
      };
    } catch (err) {
      console.error('error:getLyrics fail:', err.message);
      return null;
    }
  }

  async search(title, artist) {
    const cleanTitle = this.cleanTitle(title);
    const query = cleanTitle.includes(artist) ? cleanTitle : `${cleanTitle} ${artist}`;
    const url = `${this.searchUrl}?per_page=1&q=${encodeURIComponent(query)}`;
    const data = await (await fetch(url)).json();
    if (data?.response?.sections) {
      for (const section of data.response.sections) {
        if (section.type === 'song' && section.hits?.length > 0) {
          return section.hits[0];
        }
      }
    }
    return null;
  }

  async fetchLyrics(url) {
    const response = await fetch(url);
    const html = await response.text();
    if (!html) {
      return null;
    }
    const lyricsMatch = html.match(/<div[^>]*data-lyrics-container="true"[^>]*>(.*?)<\/div>/gs);
    if (lyricsMatch) {
      return lyricsMatch
        .map(div => {
          let text = div.replace(/<br\s*\/?>/gi, '\n');
          text = text.replace(/<[^>]*>/g, '');
          return this.decodeHtml(text);
        })
        .join('\n\n')
        .trim();
    }
    return null;
  }

  cleanTitle(title) {
    return title
      .replace(/[([](?:official|video|audio|lyric|lyrics|hq|hd|4k|mv|music video)[)\]]/gi, '')
      .replace(/ft\.|feat\.|featuring/gi, '')
      .replace(/[([].*?[)\]]/g, '')
      .trim();
  }

  decodeHtml(html) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };
    return html.replace(/&[^;]+;/g, match => entities[match] || match);
  }
}

export const geniusLyricsAPI = new GeniusLyricsAPI();
