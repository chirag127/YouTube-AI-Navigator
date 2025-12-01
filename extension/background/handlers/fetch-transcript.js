

import { jp } from '../../utils/shortcuts/core.js';


function dec(t) {
  const e = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  return t.replace(/&[^;]+;/g, m => e[m] || m);
}
function pXML(x) {
  const s = [],
    r = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([^<]*)<\/text>/g;
  let m;
  while ((m = r.exec(x)) !== null) {
    const t = dec(m[3]);
    if (t.trim()) s.push({ start: parseFloat(m[1]), duration: m[2] ? parseFloat(m[2]) : 0, text: t });
  }
  return s;
}
async function fYT(vid, lNg = 'en') {
  const fs = ['json3', 'srv3'];
  for (const f of fs) {
    try {
      const u = `https://www.youtube.com/api/timedtext?v=${vid}&lang=${lNg}&fmt=${f}`;
      if (f === 'json3') {
        const t = await fetch(u);
        if (!t) continue;
        const d = jp(t);
        if (d.events) {
          const s = d.events.filter(e => e.segs).map(e => ({
              start: e.tStartMs / 1000,
              duration: (e.dDurationMs || 0) / 1000,
              text: e.segs.map(s => s.utf8).join(''),
            }));
          if (s.length) return { success: true, data: s };
        }
      } else {
        const x = await fetch(u);
        const s = pXML(x);
        if (s.length) return { success: true, data: s };
      }
    } catch (e) {} // eslint-disable-line no-empty
  }
  return { success: false, error: 'YouTube Direct API failed' };
}
export async function handleFetchTranscript(req, rsp) {
  const { videoId, lang = 'en' } = req;
  const ms = [{ name: 'YouTube Direct API', fn: () => fYT(videoId, lang) }];
  for (const m of ms) {
    try {
      const r = await m.fn();
      if (r.success && r.data) {
        rsp(r);
        return;
      }
    } catch (e) {} // eslint-disable-line no-empty
  }
  rsp({ success: false, error: 'All transcript fetch methods failed' });
}
