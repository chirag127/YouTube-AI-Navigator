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
import { l, w } from '../utils/shortcuts.js';

export class ContextManager {
  constructor(settings) {
    this.settings = settings || {};
    this.apis = {
      tmdb: new TmdbAPI(this.settings.tmdbApiKey),
      musicbrainz: new MusicBrainzAPI(),
      igdb: new IgdbAPI(this.settings.twitchClientId, this.settings.twitchAccessToken),
      openlibrary: new OpenLibraryAPI(),
      newsdata: new NewsDataAPI(this.settings.newsDataApiKey),
      semanticscholar: new SemanticScholarAPI(),
      factcheck: new GoogleFactCheckAPI(this.settings.googleFactCheckApiKey),
      wikidata: new WikidataAPI(),
      datamuse: new DatamuseAPI(),
      openmeteo: new OpenMeteoAPI(),
    };
  }

  async fetchContext(metadata) {
    l('[ContextManager] Fetching context for:', metadata.title);
    const tasks = [];
    const context = {};

    // Helper to add task
    const addTask = (name, promise) => {
      tasks.push(promise.then(res => ({ name, res })).catch(err => ({ name, err })));
    };

    const title = metadata.title || '';
    const category = metadata.category || '';
    const author = metadata.author || '';

    // 1. Universal Context (Wikidata, Datamuse)
    addTask('wikidata', this.apis.wikidata.searchEntity(title));
    // Extract a keyword for datamuse (simple heuristic: longest word > 5 chars)
    const keyword = title.split(' ').reduce((a, b) => (a.length > b.length ? a : b), '');
    if (keyword.length > 4) {
      addTask('datamuse', this.apis.datamuse.getRelatedWords(keyword));
    }

    // 2. Category-Specific Context
    if (
      category === 'Music' ||
      title.toLowerCase().includes('official video') ||
      title.toLowerCase().includes('lyrics')
    ) {
      addTask('musicbrainz_artist', this.apis.musicbrainz.searchArtist(author));
      addTask('musicbrainz_release', this.apis.musicbrainz.searchRelease(title, author));
    }

    if (category === 'Film & Animation' || category === 'Entertainment') {
      addTask('tmdb_movie', this.apis.tmdb.searchMovie(title));
      addTask('tmdb_tv', this.apis.tmdb.searchTV(title));
    }

    if (category === 'Gaming') {
      addTask('igdb', this.apis.igdb.searchGame(title));
    }

    if (category === 'News & Politics') {
      addTask('newsdata', this.apis.newsdata.searchNews(title));
      addTask('factcheck', this.apis.factcheck.searchClaims(title));
    }

    if (category === 'Science & Technology' || category === 'Education') {
      addTask('semanticscholar', this.apis.semanticscholar.searchPaper(title));
      addTask('openlibrary', this.apis.openlibrary.searchBook(title));
    }

    if (category === 'Travel & Events' || category === 'News & Politics') {
      // Chained task for Weather: Geocode -> Get Weather
      const weatherTask = this.apis.openmeteo.getCoordinates(title).then(geo => {
        if (geo && geo.latitude && geo.longitude) {
          return this.apis.openmeteo.getWeather(geo.latitude, geo.longitude).then(weather => ({
            location: geo.name,
            country: geo.country,
            weather,
          }));
        }
        return null;
      });
      addTask('openmeteo', weatherTask);
    }

    // Execute all in parallel
    console.log(`[ContextManager] Starting ${tasks.length} parallel API calls...`);
    const results = await Promise.allSettled(tasks);

    // Process results with detailed logging
    console.log(`[ContextManager] Processing ${results.length} API call results...`);
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { name, res } = result.value;
        if (res && (Array.isArray(res) ? res.length > 0 : true)) {
          context[name] = res;
          console.log(
            `[ContextManager] ✓ ${name}: ${Array.isArray(res) ? res.length + ' items' : 'data received'
            }`
          );
        } else {
          console.log(`[ContextManager] - ${name}: no valid data returned`);
        }
      } else {
        const { name, err } = result.reason;
        console.warn(`[ContextManager] ✗ ${name}:`, err.message || err);
        // Log specific error types for debugging
        if (err.message?.includes('timeout')) {
          console.warn(`[ContextManager] ${name} timeout - API may be slow or unavailable`);
        } else if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('NetworkError')
        ) {
          console.warn(`[ContextManager] ${name} network error - check connectivity`);
        } else if (err.message?.includes('401') || err.message?.includes('403')) {
          console.warn(`[ContextManager] ${name} auth error - check API keys`);
        } else {
          console.warn(`[ContextManager] ${name} unexpected error - investigate further`);
        }
      }
    });

    l('[ContextManager] Context fetched:', Object.keys(context));
    return context;
  }
}
