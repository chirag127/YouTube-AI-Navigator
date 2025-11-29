export const parse = vtt => {
  const segments = [];
  const lines = vtt.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map(t => parseTime(t.trim()));
      i++;
      let text = '';
      while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) {
        text += lines[i].trim() + ' ';
        i++;
      }
      text = text
        .trim()
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ');
      if (text) segments.push({ start, duration: end - start, text });
    }
    i++;
  }
  return segments;
};

const parseTime = t => {
  const parts = t.split(':');
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return parseFloat(m) * 60 + parseFloat(s);
  }
  return parseFloat(parts[0]);
};
