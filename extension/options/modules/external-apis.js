
export class ExternalAPIs {
  constructor(s, a) {
    this.s = s;
    this.a = a;
  }
  init() {
    const a = this.s.get().externalApis || {};
    this.set('section-tmdbApiKey', a.tmdb?.key || '');
    this.set('newsDataApiKey', a.newsData?.key || '');
    this.set('section-googleFactCheckApiKey', a.googleFactCheck?.key || '');
    this.set('twitchClientId', a.twitch?.clientId || '');
    this.set('twitchAccessToken', a.twitch?.accessToken || '');
    this.set('semanticScholarEnabled', a.semanticScholar?.enabled ?? true);
    this.set('wikidataEnabled', a.wikidata?.enabled ?? true);
    this.set('openLibraryEnabled', a.openLibrary?.enabled ?? true);
    this.set('datamuseEnabled', a.datamuse?.enabled ?? true);
    this.set('openMeteoEnabled', a.openMeteo?.enabled ?? true);
    this.set('section-sponsorBlockTimeout', a.sponsorBlock?.timeout || 5000);
    this.set('section-deArrowTimeout', a.deArrow?.timeout || 5000);
    this.a.attachToAll({
      'section-tmdbApiKey': { path: 'externalApis.tmdb.key' },
      newsDataApiKey: { path: 'externalApis.newsData.key' },
      'section-googleFactCheckApiKey': { path: 'externalApis.googleFactCheck.key' },
      twitchClientId: { path: 'externalApis.twitch.clientId' },
      twitchAccessToken: { path: 'externalApis.twitch.accessToken' },
      semanticScholarEnabled: { path: 'externalApis.semanticScholar.enabled' },
      wikidataEnabled: { path: 'externalApis.wikidata.enabled' },
      openLibraryEnabled: { path: 'externalApis.openLibrary.enabled' },
      datamuseEnabled: { path: 'externalApis.datamuse.enabled' },
      openMeteoEnabled: { path: 'externalApis.openMeteo.enabled' },
      'section-sponsorBlockTimeout': { path: 'externalApis.sponsorBlock.timeout' },
      'section-deArrowTimeout': { path: 'externalApis.deArrow.timeout' },
    });
  }
  set(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = v;
    else if (el.type === 'number') el.value = Number(v);
    else el.value = v;
  }
}
