
import { jp } from '../../utils/shortcuts/core.js';

import { mp } from '../../utils/shortcuts/core.js';


export const extractSection = (t, sn) => {
  const r = new RegExp(`## ${sn}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
  const m = t.match(r);
  return m ? m[1].trim() : null;
};

export const extractTimestamps = t => {
  if (!t) return [];
  const r = /\[(\d{1,2}):(\d{2})\]/g;
  const ts = [];
  let m;
  while ((m = r.exec(t)) !== null) {
    const min = parseInt(m[1], 10);
    const sec = parseInt(m[2], 10);
    ts.push(min * 60 + sec);
  }
  return [...new Set(ts)].sort((a, b) => a - b);
};

export const parseSegmentsJSON = r => {
  let cr = r.trim();
  cr = cr.replace(/```json\s*/g, '');
  cr = cr.replace(/```\s*/g, '');
  cr = cr.trim();
  let jm = cr.match(/\{[\s\S]*\}/);
  if (!jm) {
    console.error('error:parseSegmentsJSON no JSON:', r);
    return null;
  }
  const jsStr = jm[0];
  const p = jp(jsStr);
  if (!p.segments || !Array.isArray(p.segments)) {
    console.error('error:parseSegmentsJSON inv struct:', p);
    return null;
  }
  return p;
};

export const expandLabel = sc => {
  if (!sc) return null;
  const lm = {
    sponsor: 'Sponsor',
    selfpromo: 'Self Promotion',
    interaction: 'Interaction Reminder',
    intro: 'Intro',
    outro: 'Outro',
    preview: 'Preview',
    music_offtopic: 'Music: Off-Topic',
    poi_highlight: 'Highlight',
    filler: 'Filler',
    exclusive_access: 'Exclusive Access',
    hook: 'Hook',
    chapter: 'Chapter',
    content: 'Content',
  };
  return lm[sc] || sc;
};

export const transformSegments = (parsed, expandLabelFn) => {
  return mp(parsed.segments, s => ({
    start: s.s,
    end: s.e,
    label: s.l,
    labelFull: expandLabelFn(s.l),
    title: s.t,
    description: s.d,
    text: s.d,
  }));
};
