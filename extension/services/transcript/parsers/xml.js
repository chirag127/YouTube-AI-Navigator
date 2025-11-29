export const parse = xml => {
  const segments = [];
  const regex = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([^<]*)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1]);
    const duration = match[2] ? parseFloat(match[2]) : 0;
    const text = decodeHTML(match[3]);
    if (text.trim()) segments.push({ start, duration, text });
  }
  return segments;
};

const decodeHTML = text => {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  return text.replace(/&[^;]+;/g, m => entities[m] || m);
};
