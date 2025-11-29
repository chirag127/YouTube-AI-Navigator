import { $, $$, l, cw, ce, cd, st, nt, spt, mp, tr } from '../../../utils/shortcuts.js';
class DOMAutomationStrategy {
  constructor() {
    this.name = 'DOM Automation';
    this.priority = 1;
    this.logger = this._createLogger('DOM-Automation');
  }
  _createLogger(p) {
    return {
      info: (m, ...a) => l(`[${p}]ℹ️${m}`, ...a),
      success: (m, ...a) => l(`[${p}]✅${m}`, ...a),
      warn: (m, ...a) => cw(`[${p}]⚠️${m}`, ...a),
      error: (m, ...a) => ce(`[${p}]❌${m}`, ...a),
      debug: (m, ...a) => cd(`[${p}]🔍${m}`, ...a),
    };
  }
  async fetch(v, lg = 'en') {
    this.logger.info(`Starting DOM automation for ${v}...`);
    try {
      let tc = $(
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]'
      );
      if (!this._isTranscriptVisible(tc)) {
        this.logger.debug('Transcript panel not visible, attempting to open...');
        await this._openTranscriptPanel();
      } else this.logger.debug('Transcript panel already visible');
      await this._waitForSegments();
      const s = this._scrapeSegments();
      if (!s || s.length === 0) throw new Error('No segments found after automation');
      this.logger.success(`Successfully scraped ${s.length} segments`);
      return s;
    } catch (x) {
      this.logger.error('Automation failed:', x.message);
      throw x;
    }
  }
  _isTranscriptVisible(c) {
    return c && c.visibility !== 'hidden' && c.offsetParent !== null;
  }
  async _openTranscriptPanel() {
    const eb = $('#expand');
    if (eb && eb.offsetParent !== null) {
      this.logger.debug('Clicking description expand button...');
      eb.click();
      await this._wait(500);
    }
    const sels = [
      'button[aria-label="Show transcript"]',
      'ytd-button-renderer[aria-label="Show transcript"]',
      '#primary-button button[aria-label="Show transcript"]',
    ];
    let stb = null;
    for (const s of sels) {
      stb = $(s);
      if (stb) break;
    }
    if (!stb) {
      const btns = $$('button, ytd-button-renderer');
      stb = btns.find(b => b.textContent.includes('Show transcript'));
    }
    if (stb) {
      this.logger.debug('Clicking "Show transcript" button...');
      stb.click();
      await this._wait(1000);
    } else throw new Error('"Show transcript" button not found');
  }
  async _waitForSegments(to = 5000) {
    const st = nt();
    while (nt() - st < to) {
      const s = $$('ytd-transcript-segment-renderer');
      if (s.length > 0) return;
      await this._wait(500);
    }
    throw new Error('Timeout waiting for transcript segments');
  }
  _scrapeSegments() {
    const ses = $$('ytd-transcript-segment-renderer'),
      s = [];
    ses.forEach(el => {
      const tse = $('.segment-timestamp', el),
        te = $('.segment-text', el);
      if (tse && te) {
        const ts = tr(tse.textContent),
          t = tr(te.textContent),
          st = this._parseTimestamp(ts);
        s.push({ start: st, text: t, duration: 0 });
      }
    });
    for (let i = 0; i < s.length; i++) {
      if (i < s.length - 1) s[i].duration = s[i + 1].start - s[i].start;
      else s[i].duration = 5;
    }
    return s;
  }
  _parseTimestamp(s) {
    const p = mp(spt(s, ':'), Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    else if (p.length === 2) return p[0] * 60 + p[1];
    return 0;
  }
  _wait(ms) {
    return new Promise(r => st(r, ms));
  }
}
export const strategy = new DOMAutomationStrategy();
