// String utilities
export const lc = s => s.toLowerCase();
export const uc = s => s.toUpperCase();
export const tr = s => s.trim();
export const sub = (s, i, l) => s.substr(i, l);
export const slc = (s, b, e) => s.slice(b, e);
export const rep = (s, a, b) => s.replace(a, b);
export const spl = (s, d) => s.split(d);
export const incs = (s, v) => s.includes(v); // renamed from inc to avoid conflict with array
export const sw = (s, v) => s.startsWith(v);
export const ew = (s, v) => s.endsWith(v);
