// Array utilities
export const af = Array.from;
export const ia = Array.isArray;
export const fe = (a, f) => a.forEach(f);
export const mp = (a, f) => a.map(f);
export const fl = (a, f) => a.filter(f);
export const rd = (a, f, i) => a.reduce(f, i);
export const fnd = (a, f) => a.find(f);
export const inca = (a, v) => a.includes(v); // renamed from inc to avoid conflict with string
export const ps = (a, v) => a.push(v);
export const sl = (a, s, e) => a.slice(s, e);
export const sp = (a, s, d) => a.splice(s, d);
export const jn = (a, s) => a.join(s);
export const srt = (a, f) => a.sort(f);
export const len = a => a.length;
