




const API_BASE = 'https://sponsor.ajay.app/api';

async function _gh(vid) {
  const e = new TextEncoder();
  const d = e.encode(vid);
  const hb = await crypto.subtle.digest('SHA-256', d);
  const ha = af(new Uint8Array(hb));
  const hh = ha.map(b => b.toString(16).padStart(2, '0')).join('');
  return hh.substring(0, 4);
}

const CATEGORIES = [
  'sponsor',
  'selfpromo',
  'interaction',
  'intro',
  'outro',
  'preview',
  'hook',
  'music_offtopic',
  'poi_highlight',
  'filler',
  'exclusive_access',
  'chapter',
  'content',
];

export async function fetchSegments(vid) {
  if (!vid) {
    console.warn('[SB] No vid');
    return [];
  }
  try {
    const hp = await _gh(vid);
    const cp = CATEGORIES.map(x => `category=${x}`).join('&');
    const u = `${API_BASE}/skipSegments/${hp}?service=YouTube&${cp}`;

    const r = await fetch(u);
    if (r.status === 404) {
      return [];
    }
    if (r.status === 429) {
      console.warn('[SB] 429');
      return [];
    }
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();

    const vd = d.find(v => v.videoID === vid);
    if (!vd || !vd.segments) {
      return [];
    }
    const s = vd.segments.map(sg => {
      return {
        start: sg.segment[0]);

    return s;
  } catch (x) {
    (()=>{const e=document.createElement('[API:Fail:SponsorBlock] Fail:');e.className=x.message;return e;})();
    return [];
  }
}
export const sponsorBlockAPI = { fetchSegments };
