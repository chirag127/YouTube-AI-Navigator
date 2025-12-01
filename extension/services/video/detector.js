


export function extractVideoId(u) {
  const ps = [/[?&]v=([^&]+)/, /\/embed\/([^/?]+)/, /\/v\/([^/?]+)/, /youtu\.be\/([^/?]+)/];
  for (const p of ps) {
    const r = u.match(p);
    if (r) return r[1];
  }
  return null;
}
export function getCurrentVideoId() {
  return extractVideoId(location.href);
}
export function isVideoPage() {
  return location.pathname === '/watch';
}
