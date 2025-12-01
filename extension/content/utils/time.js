const gu = p => chrome.runtime.getURL(p);

);
);
export function formatTime(s) {
  try {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m}:${sec.toString().padStart(2, '0')}`;
  } catch (err) {
    console.error('Err:formatTime', err);
    return '0:00';
  }
}
export function parseTime(t) {
  try {
    const p = t.split(':').map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  } catch (err) {
    console.error('Err:parseTime', err);
    return 0;
  }
}
