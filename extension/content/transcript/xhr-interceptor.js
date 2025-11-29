import { l, w, e, d } from '../../utils/shortcuts/logging.js';
import { jp, js } from '../../utils/shortcuts/core.js';
import { ce } from '../../utils/shortcuts/dom.js';
class TranscriptInterceptor {
  constructor() {
    this.it = new Map();
    this.im = new Map();
    this.ii = false;
    this.lg = this._cl('XHR');
  }
  _cl(p) {
    return {
      i: (m, ...a) => l(`[${p}]ℹ️${m}`, ...a),
      s: (m, ...a) => l(`[${p}]✅${m}`, ...a),
      w: (m, ...a) => w(`[${p}]⚠️${m}`, ...a),
      e: (m, ...a) => e(`[${p}]❌${m}`, ...a),
      d: (m, ...a) => d(`[${p}]🔍${m}`, ...a),
    };
  }
  init() {
    if (this.ii) {
      this.lg.w('Init');
      return;
    }
    const s = this;
    const oo = XMLHttpRequest.prototype.open;
    const os = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u, ...a) {
      this._iu = u;
      this._im = m;
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
          } catch (e) {
            // intentional
          }
          if (rb) s._pr(x._iu, rb, x.responseURL);
        }
      });
      return os.apply(this, [b]);
    };
    this.ii = true;
    this.lg.d('XHR ok');
  }
  _if() {
    const s = this;
    const of = window.fetch;
    window.fetch = async function (r) {
      const u = typeof r === 'string' ? r : r.url;
      const rs = await of.apply(this, arguments);
      const cr = rs.clone();
      s._pf(u, cr).catch(e => s.lg.d('Fetch err:', e.message));
      return rs;
    };
    this.lg.d('Fetch ok');
  }
  _pr(u, rt) {
    if (!u) return;
    try {
      if (u.includes('/timedtext') || u.includes('/api/timedtext')) this._ht(u, rt);
      else if (u.includes('/player') || u.includes('ytInitialPlayerResponse')) this._hp(u, rt);
    } catch (x) {
      this.lg.d('Proc err:', x.message);
    }
  }
  async _pf(u, r) {
    if (!u) return;
    try {
      if (u.includes('/timedtext') || u.includes('/api/timedtext')) {
        const t = await r.text();
        this._ht(u, t);
      } else if (u.includes('/player') || u.includes('ytInitialPlayerResponse')) {
        const t = await r.text();
        this._hp(u, t);
      }
    } catch (x) {
      this.lg.d('PF err:', x.message);
    }
  }
  _ht(u, rt) {
    try {
      const uo = new URL(u, window.location.origin);
      const lg = uo.searchParams.get('lang') || uo.searchParams.get('tlang') || 'en';
      const v = uo.searchParams.get('v');
      this.lg.d(`Cap tr:lang=${lg},v=${v}`);
      const k = `${v || 'current'}_${lg}`;
      this.it.set(k, { lang: lg, videoId: v, data: rt, timestamp: Date.now(), url: u });
      const s = this._pt(rt);
      if (s.length > 0) {
        this.it.set(`${k}_parsed`, s);
        this.lg.s(`Parsed ${s.length} seg for ${lg}`);
      }
      window.dispatchEvent(
        new CustomEvent('transcriptIntercepted', { detail: { lang: lg, videoId: v, segments: s } })
      );
    } catch (x) {
      this.lg.e('HT err:', x.message);
    }
  }
  _hp(u, rt) {
    try {
      const d = jp(rt);
      if (d.videoDetails) {
        const v = d.videoDetails.videoId;
        this.lg.d(`Cap meta:${v}`);
        this.im.set(v, {
          videoDetails: d.videoDetails,
          captions: d.captions,
          timestamp: Date.now(),
        });
        window.dispatchEvent(
          new CustomEvent('metadataIntercepted', { detail: { videoId: v, metadata: d } })
        );
      }
    } catch (x) {
      this.lg.d('HP err:', x.message);
    }
  }
  _pt(rt) {
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
      return this._px(rt);
    }
    return [];
  }
  _px(xt) {
    const s = [];
    const r = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([^<]*)<\/text>/g;
    let m;
    while ((m = r.exec(xt)) !== null) {
      const st = parseFloat(m[1]),
        d = m[2] ? parseFloat(m[2]) : 0,
        t = this._dh(m[3]);
      if (t.trim()) s.push({ start: st, duration: d, text: t });
    }
    return s;
  }
  _dh(t) {
    const ta = ce('textarea');
    ta.innerHTML = t;
    return ta.value;
  }
  getTranscript(v, lg = 'en') {
    const k = `${v}_${lg}_parsed`;
    const t = this.it.get(k);
    if (t) {
      this.lg.d(`Get tr:${lg},${t.length}seg`);
      return t;
    }
    const ck = `current_${lg}_parsed`;
    return this.it.get(ck);
  }
  getMetadata(v) {
    return this.im.get(v);
  }
  getAvailableLanguages(v) {
    const l = new Set();
    for (const [k, val] of this.it.entries()) {
      if (k.includes(v) && val.lang) l.add(val.lang);
    }
    return Array.from(l);
  }
  clear() {
    this.it.clear();
    this.im.clear();
    this.lg.i('Cleared');
  }
  getStats() {
    return { transcripts: this.it.size, metadata: this.im.size, isInitialized: this.ii };
  }
}
const ti = new TranscriptInterceptor();
ti.init();
export default ti;
export { TranscriptInterceptor };
