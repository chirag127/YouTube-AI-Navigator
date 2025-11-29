import { ce } from '../../utils/shortcuts/dom.js';

export function findSecondaryColumn() {
  const s = [
    '#secondary-inner',
    '#secondary',
    '#related',
    'ytd-watch-next-secondary-results-renderer',
    '#columns #secondary',
    'ytd-watch-flexy #secondary',
  ];
  for (const sel of s) {
    const e = document.querySelector(sel);
    if (e && (e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0)) return e;
  }
  for (const sel of s) {
    const e = document.querySelector(sel);
    if (e) return e;
  }
  return null;
}
export function isWidgetProperlyVisible(w) {
  if (!w || !document.contains(w)) return false;
  const s = window.getComputedStyle(w);
  if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
  const p = w.parentElement;
  if (!p) return false;
  const sc = findSecondaryColumn();
  if (!sc || p !== sc || p.firstChild !== w) return false;
  return true;
}
export function seekVideo(t) {
  const v = document.querySelector('video');
  if (v) {
    v.currentTime = t;
    v.play();
  }
}
export function getVideoElement() {
  return document.querySelector('video');
}
export function decodeHTML(h) {
  const t = ce('textarea');
  t.innerHTML = h;
  return t.value;
}
