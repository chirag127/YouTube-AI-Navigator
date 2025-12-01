

export function chunkText(t, s = 20000, o = 500) {
  if (!t) {
    return [];
  }
  if (t.length <= s) {
    return [t];
  }
  const c = [];
  let i = 0;
  while (i < t.length) {
    let e = i + s;
    if (e < t.length) {
      const sp = t.lastIndexOf(' '),
        p = t.lastIndexOf('.');
      if (p > i + s * 0.5) e = p + 1;
      else if (sp > i) e = sp + 1;
    }
    const ch = sub(t, i, e).trim();
    if (ch) c.push(ch);
    i = e - o;
    if (i >= e) i = e;
  }
  return c;
}
