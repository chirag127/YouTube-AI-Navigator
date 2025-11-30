import { qs as i } from '../../utils/shortcuts/dom.js';
export class ExternalAPIs {
  constructor(s, a) {
    this.s = s;
    this.a = a;
  }
  init() {
    const a = this.s.get().externalApis || {};
    this.set('tmdbApiKey', a.tmdb?.key || '');
    this.set('tmdbEnabled', a.tmdb?.enabled ?? true);
    this.set('newsDataApiKey', a.newsData?.key || '');
    this.set('newsDataEnabled', a.newsData?.enabled ?? true);
    this.set('googleFactCheckApiKey', a.googleFactCheck?.key || '');
    this.set('googleFactCheckEnabled', a.googleFactCheck?.enabled ?? true);
    this.set('igdbClientId', a.igdb?.clientId || '');
    this.set('igdbAccessToken', a.igdb?.accessToken || '');
    this.set('igdbEnabled', a.igdb?.enabled ?? true);
    this.set('musicBrainzEnabled', a.musicBrainz?.enabled ?? true);
    this.set('openLibraryEnabled', a.openLibrary?.enabled ?? true);
    this.set('semanticScholarEnabled', a.semanticScholar?.enabled ?? true);
    this.set('wikidataEnabled', a.wikidata?.enabled ?? true);
    this.set('datamuseEnabled', a.datamuse?.enabled ?? true);
    this.set('openMeteoEnabled', a.openMeteo?.enabled ?? true);
    this.set('geniusLyricsEnabled', a.geniusLyrics?.enabled ?? true);
    this.set('deArrowEnabled', a.deArrow?.enabled ?? true);
    this.set('deArrowUsePrivateAPI', a.deArrow?.usePrivateAPI ?? true);
    this.set('deArrowTimeout', a.deArrow?.timeout || 5000);
    this.set('sponsorBlockEnabled', a.sponsorBlock?.enabled ?? true);
    this.set('sponsorBlockTimeout', a.sponsorBlock?.timeout || 5000);
    this.a.attachToAll({
      tmdbApiKey: { path: 'externalApis.tmdb.key' },
      tmdbEnabled: { path: 'externalApis.tmdb.enabled' },
      newsDataApiKey: { path: 'externalApis.newsData.key' },
      newsDataEnabled: { path: 'externalApis.newsData.enabled' },
      googleFactCheckApiKey: { path: 'externalApis.googleFactCheck.key' },
      googleFactCheckEnabled: { path: 'externalApis.googleFactCheck.enabled' },
      igdbClientId: { path: 'externalApis.igdb.clientId' },
      igdbAccessToken: { path: 'externalApis.igdb.accessToken' },
      igdbEnabled: { path: 'externalApis.igdb.enabled' },
      musicBrainzEnabled: { path: 'externalApis.musicBrainz.enabled' },
      openLibraryEnabled: { path: 'externalApis.openLibrary.enabled' },
      semanticScholarEnabled: { path: 'externalApis.semanticScholar.enabled' },
      wikidataEnabled: { path: 'externalApis.wikidata.enabled' },
      datamuseEnabled: { path: 'externalApis.datamuse.enabled' },
      openMeteoEnabled: { path: 'externalApis.openMeteo.enabled' },
      geniusLyricsEnabled: { path: 'externalApis.geniusLyrics.enabled' },
      deArrowEnabled: { path: 'externalApis.deArrow.enabled' },
      deArrowUsePrivateAPI: { path: 'externalApis.deArrow.usePrivateAPI' },
      deArrowTimeout: { path: 'externalApis.deArrow.timeout' },
      sponsorBlockEnabled: { path: 'externalApis.sponsorBlock.enabled' },
      sponsorBlockTimeout: { path: 'externalApis.sponsorBlock.timeout' },
    });
  }
  set(id, v) {
    const el = i(`#${id}`);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = v;
    else if (el.type === 'number') el.value = Number(v);
    else el.value = v;
  }
}
