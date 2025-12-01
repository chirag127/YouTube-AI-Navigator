

export class APIDetector {
  static async checkSponsorBlock() {
    try {
      const r = await fetch('https://sponsor.ajay.app/api/skipSegments', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      return r.ok || r.status === 400;
    } catch (x) {
      console.error('[APIDetector] SponsorBlock unavailable:', x.message);
      return false;
    }
  }

  static async checkDeArrow() {
    try {
      const r = await fetch('https://sponsor.ajay.app/api/branding', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      return r.ok || r.status === 400;
    } catch (x) {
      console.error('[APIDetector] DeArrow unavailable:', x.message);
      return false;
    }
  }

  static async checkGemini(apiKey) {
    if (!apiKey) return false;
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      return r.ok;
    } catch (x) {
      console.error('[APIDetector] Gemini unavailable:', x.message);
      return false;
    }
  }

  static async checkTMDB(apiKey) {
    if (!apiKey) return false;
    try {
      const r = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`, {
        signal: AbortSignal.timeout(5000),
      });
      return r.ok;
    } catch (x) {
      console.error('[APIDetector] TMDB unavailable:', x.message);
      return false;
    }
  }

  static async checkNewsData(apiKey) {
    if (!apiKey) return false;
    try {
      const r = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&q=test&language=en`, {
        signal: AbortSignal.timeout(5000),
      });
      return r.ok;
    } catch (x) {
      console.error('[APIDetector] NewsData unavailable:', x.message);
      return false;
    }
  }

  static async checkGoogleFactCheck(apiKey) {
    if (!apiKey) return false;
    try {
      const r = await fetch(
        `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${apiKey}&query=test`,
        { signal: AbortSignal.timeout(5000) }
      );
      return r.ok;
    } catch (x) {
      console.error('[APIDetector] GoogleFactCheck unavailable:', x.message);
      return false;
    }
  }

  static async getAvailableAPIs(config = {}) {
    const { ai = {}, externalApis = {} } = config;
    const availability = {
      sponsorBlock: await this.checkSponsorBlock(),
      deArrow: await this.checkDeArrow(),
      gemini: await this.checkGemini(ai.apiKey),
      tmdb: await this.checkTMDB(externalApis.tmdb),
      newsData: await this.checkNewsData(externalApis.newsData),
      googleFactCheck: await this.checkGoogleFactCheck(externalApis.googleFactCheck),
    };
    console.log('[APIDetector] Available APIs:', availability);
    return availability;
  }
}
