import { TmdbAPI } from '../api/tmdb.js';
import { MusicBrainzAPI } from '../api/musicbrainz.js';
import { IgdbAPI } from '../api/igdb.js';
import { OpenLibraryAPI } from '../api/openlibrary.js';
import { NewsDataAPI } from '../api/newsdata.js';
import { SemanticScholarAPI } from '../api/semanticscholar.js';
import { GoogleFactCheckAPI } from '../api/google-factcheck.js';
import { WikidataAPI } from '../api/wikidata.js';
import { DatamuseAPI } from '../api/datamuse.js';
import { OpenMeteoAPI } from '../api/openmeteo.js';

export class ContextManager {
  constructor(s) {
    this.s = s || {};
    this.apis = {
      tmdb: new TmdbAPI(this.s.tmdb?.key),
      musicbrainz: new MusicBrainzAPI(),
      igdb: new IgdbAPI(this.s.igdb?.clientId, this.s.igdb?.accessToken),
      openlibrary: new OpenLibraryAPI(),
      newsdata: new NewsDataAPI(this.s.newsData?.key),
      semanticscholar: new SemanticScholarAPI(),
      factcheck: new GoogleFactCheckAPI(this.s.googleFactCheck?.key),
      wikidata: new WikidataAPI(),
      datamuse: new DatamuseAPI(),
      openmeteo: new OpenMeteoAPI(),
    };
    this.enabled = {
      tmdb: this.s.tmdb?.enabled ?? true,
      musicbrainz: this.s.musicBrainz?.enabled ?? true,
      igdb: this.s.igdb?.enabled ?? true,
      openlibrary: this.s.openLibrary?.enabled ?? true,
      newsdata: this.s.newsData?.enabled ?? true,
      semanticscholar: this.s.semanticScholar?.enabled ?? true,
      factcheck: this.s.googleFactCheck?.enabled ?? true,
      wikidata: this.s.wikidata?.enabled ?? true,
      datamuse: this.s.datamuse?.enabled ?? true,
      openmeteo: this.s.openMeteo?.enabled ?? true,
    };
  }
  async fetchContext(m) {
    const tasks = [],
      ctx = {};
    const add = (n, p) => {
      if (!this.enabled[n.split('_')[0]]) return;
      tasks.push(p.then(res => ({ n, res })).catch(err => ({ n, err })));
    };
    const t = m.title || '',
      c = m.category || '',
      a = m.author || '';
    add('wikidata', this.apis.wikidata.searchEntity(t));
    const k = t.split(' ').reduce((a, b) => (a.length > b.length ? a : b), '');
    if (k.length > 4) add('datamuse', this.apis.datamuse.getRelatedWords(k));
    if (
      c === 'Music' ||
      t.toLowerCase().includes('official video') ||
      t.toLowerCase().includes('lyrics')
    ) {
      add('musicbrainz_artist', this.apis.musicbrainz.searchArtist(a));
      add('musicbrainz_release', this.apis.musicbrainz.searchRelease(t, a));
    }
    if (c === 'Film & Animation' || c === 'Entertainment') {
      add('tmdb_movie', this.apis.tmdb.searchMovie(t));
      add('tmdb_tv', this.apis.tmdb.searchTV(t));
    }
    if (c === 'Gaming') add('igdb', this.apis.igdb.searchGame(t));
    if (c === 'News & Politics') {
      add('newsdata', this.apis.newsdata.searchNews(t));
      add('factcheck', this.apis.factcheck.searchClaims(t));
    }
    if (c === 'Science & Technology' || c === 'Education') {
      add('semanticscholar', this.apis.semanticscholar.searchPaper(t));
      add('openlibrary', this.apis.openlibrary.searchBook(t));
    }
    if (c === 'Travel & Events' || c === 'News & Politics') {
      add(
        'openmeteo',
        this.apis.openmeteo.getCoordinates(t).then(g => {
          if (g && g.latitude && g.longitude)
            return this.apis.openmeteo
              .getWeather(g.latitude, g.longitude)
              .then(w => ({ location: g.name, country: g.country, weather: w }));
          return null;
        })
      );
    }
    const r = await Promise.allSettled(tasks);
    r.forEach(res => {
      if (res.status === 'fulfilled') {
        const { n, res: d } = res.value;
        if (d && (Array.isArray(d) ? d.length > 0 : true)) {
          ctx[n] = d;
        }
      } else {
        const { n, err: e } = res.reason;
        console.warn(`[ContextManager] ✗ ${n}:`, e.message || e);
        if (e.message?.includes('timeout')) console.warn(`[ContextManager] ${n} timeout`);
        else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError'))
          console.warn(`[ContextManager] ${n} network error`);
        else if (e.message?.includes('401') || e.message?.includes('403'))
          console.warn(`[ContextManager] ${n} auth error`);
        else console.warn(`[ContextManager] ${n} unexpected error`);
      }
    });
    return ctx;
  }
}
