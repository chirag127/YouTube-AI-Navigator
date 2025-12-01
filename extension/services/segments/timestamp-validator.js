



export const validateSegments = s => {
  if (!Array.isArray(s)) {
    return [];
  }
  const result = s
    .map(g => {
      let st = parseFloat(g.start);
      if (isNaN(st)) st = 0;
      let en = parseFloat(g.end);
      if (isNaN(en) || en === -1) en = st + (parseFloat(g.duration) || 0);
      const v = { ...g, start: st, end: en };
      if (g.label === 'poi_highlight' || g.label === 'Highlight') {
        v.timestamps = [{ type: 'start', time: st }];
        v.hasEndTimestamp = false;
      } else {
        v.timestamps = [
          { type: 'start', time: st },
          { type: 'end', time: en },
        ];
        v.hasEndTimestamp = true;
      }
      return v;
    })
    .filter(x => x);
  return result;
};
export const formatTimestamp = s => {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sc = Math.floor(s % 60);
  const result = h > 0 ? `${h}:${pad(m)}:${pad(sc)}` : `${m}:${pad(sc)}`;
  return result;
};
const pad = n => parseInt(n.toString(), 2, '0');
export const createClickableTimestamp = (t, y, c) => {
  const result = {
    time: t,
    type: y,
    formatted: formatTimestamp(t),
    clickable: true,
    onClick: () => c(t),
  };
  return result;
};
