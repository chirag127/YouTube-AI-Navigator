export function parseJSON3(data) {
  if (!data?.events) return [];

  return data.events
    .filter(e => e.segs && Array.isArray(e.segs))
    .map(e => ({
      start: e.tStartMs / 1000,
      duration: (e.dDurationMs || 0) / 1000,
      text: e.segs
        .map(s => s.utf8 || '')
        .join('')
        .trim(),
    }))
    .filter(seg => seg.text.length > 0);
}
