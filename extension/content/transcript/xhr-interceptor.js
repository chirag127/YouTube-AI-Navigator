import { l, w, e, d, ce, jp, js } from '../../utils/shortcuts.js';

class TranscriptInterceptor {
  constructor() {
    this.interceptedTranscripts = new Map();
    this.interceptedMetadata = new Map();
    this.isInitialized = false;
    this.logger = this._createLogger('XHR-Interceptor');
  }

  _createLogger(p) {
    return {
      info: (m, ...a) => l(`[${p}] ℹ️ ${m}`, ...a),
      success: (m, ...a) => l(`[${p}] ✅ ${m}`, ...a),
      warn: (m, ...a) => w(`[${p}] ⚠️ ${m}`, ...a),
      error: (m, ...a) => e(`[${p}] ❌ ${m}`, ...a),
      debug: (m, ...a) => d(`[${p}] 🔍 ${m}`, ...a),
    };
  }

  init() {
    if (this.isInitialized) {
      this.logger.warn('Already initialized');
      return;
    }
    const self = this;
    const oo = XMLHttpRequest.prototype.open;
    const os = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u, ...a) {
      this._interceptedUrl = u;
      this._interceptedMethod = m;
      return oo.apply(this, [m, u, ...a]);
    };
    XMLHttpRequest.prototype.send = function (b) {
      const x = this;
      x.addEventListener('readystatechange', function () {
        if (this.readyState === 4 && this.status === 200) {
          let rb;
          try {
            if (x.responseType === '' || x.responseType === 'text') rb = x.responseText;
            else if (x.responseType === 'json') rb = js(x.response);
          } catch (e) {}
          if (rb) self._processResponse(x._interceptedUrl, rb, x.responseURL);
        }
      });
      return os.apply(this, [b]);
    };
    this.logger.debug('XHR interception installed');
  }

  _interceptFetch() {
    const self = this;
    const of = window.fetch;
    window.fetch = async function (r) {
      const u = typeof r === 'string' ? r : r.url;
      const res = await of.apply(this, arguments);
      const cr = res.clone();
      self
        ._processFetchResponse(u, cr)
        .catch(e => self.logger.debug('Error processing fetch response:', e.message));
      return res;
    };
    this.logger.debug('Fetch interception installed');
  }

  _processResponse(u, rt, ru) {
    if (!u) return;
    try {
      if (u.includes('/timedtext') || u.includes('/api/timedtext'))
        this._handleTranscriptResponse(u, rt);
      else if (u.includes('/player') || u.includes('ytInitialPlayerResponse'))
        this._handlePlayerResponse(u, rt);
    } catch (x) {
      this.logger.debug('Error processing response:', x.message);
    }
  }

  async _processFetchResponse(u, r) {
    if (!u) return;
    try {
      if (u.includes('/timedtext') || u.includes('/api/timedtext')) {
        const t = await r.text();
        this._handleTranscriptResponse(u, t);
      } else if (u.includes('/player') || u.includes('ytInitialPlayerResponse')) {
        const t = await r.text();
        this._handlePlayerResponse(u, t);
      }
    } catch (x) {
      this.logger.debug('Error profetch response:', x.message);
    }
  }

  _handleTranscriptResponse(u, rt) {
    try {
      const uo = new URL(u, window.location.origin);
      const lang = uo.searchParams.get('lang') || uo.searchParams.get('tlang') || 'en';
      const vid = uo.searchParams.get('v');
      this.logger.debug(`Captured transcript: lang=${lang}, videoId=${vid}`);
      const k = `${vid || 'current'}_${lang}`;
      this.interceptedTranscripts.set(k, {
        lang,
        videoId: vid,
        data: rt,
        timestamp: Date.now(),
        url: u,
      });
      const s = this._parseTranscriptResponse(rt, u);
      if (s.length > 0) {
        this.interceptedTranscripts.set(`${k}_parsed`, s);
        this.logger.success(`Parsed ${s.length} transcript segments for ${lang}`);
      }
      window.dispatchEvent(
        new CustomEvent('transcriptIntercepted', { detail: { lang, videoId: vid, segments: s } })
      );
    } catch (x) {
      this.logger.error('Error handling transcript response:', x.message);
    }
  }

  _handlePlayerResponse(u, rt) {
    try {
      const d = jp(rt);
      if (d.videoDetails) {
        const vid = d.videoDetails.videoId;
        this.logger.debug(`Captured metadata for video: ${vid}`);
        this.interceptedMetadata.set(vid, {
          videoDetails: d.videoDetails,
          captions: d.captions,
          timestamp: Date.now(),
        });
        window.dispatchEvent(
          new CustomEvent('metadataIntercepted', { detail: { videoId: vid, metadata: d } })
        );
      }
    } catch (x) {
      this.logger.debug('Error handling player response:', x.message);
    }
  }

  _parseTranscriptResponse(rt, u) {
    try {
      const d = jp(rt);
      if (d.events)
        return d.events
          .filter(e => e.segs)
          .map(e => ({
            start: e.tStartMs / 1000,
            duration: (e.dDurationMs || 0) / 1000,
            text: e.segs.map(s => s.utf8).join(''),
          }));
    } catch (e) {
      return this._parseXMLTranscript(rt);
    }
    return [];
  }

  _parseXMLTranscript(xt) {
    const s = [];
    const r = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([^<]*)<\/text>/g;
    let m;
    while ((m = r.exec(xt)) !== null) {
      const st = parseFloat(m[1]),
        d = m[2] ? parseFloat(m[2]) : 0,
        t = this._decodeHTML(m[3]);
      if (t.trim()) s.push({ start: st, duration: d, text: t });
    }
    return s;
  }

  _decodeHTML(t) {
    const ta = ce('textarea');
    ta.innerHTML = t;
    return ta.value;
  }

  getTranscript(vid, lang = 'en') {
    const k = `${vid}_${lang}_parsed`;
    const t = this.interceptedTranscripts.get(k);
    if (t) {
      this.logger.debug(`Retrieved intercepted transcript: ${lang}, ${t.length} segments`);
      return t;
    }
    const ck = `current_${lang}_parsed`;
    return this.interceptedTranscripts.get(ck);
  }

  getMetadata(vid) {
    return this.interceptedMetadata.get(vid);
  }

  getAvailableLanguages(vid) {
    const l = new Set();
    for (const [k, v] of this.interceptedTranscripts.entries()) {
      if (k.includes(vid) && v.lang) l.add(v.lang);
    }
    return Array.from(l);
  }

  clear() {
    this.interceptedTranscripts.clear();
    this.interceptedMetadata.clear();
    this.logger.info('Cleared intercepted data');
  }
  getStats() {
    return {
      transcripts: this.interceptedTranscripts.size,
      metadata: this.interceptedMetadata.size,
      isInitialized: this.isInitialized,
    };
  }
}

const ti = new TranscriptInterceptor();
ti.init();
export default ti;
export { TranscriptInterceptor };
