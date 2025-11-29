// Core JavaScript utilities
export const ok = Object.keys;
export const ov = Object.values;
export const oe = Object.entries;
export const oa = Object.assign;
export const fr = Object.fromEntries;
export const jp = JSON.parse;
export const js = JSON.stringify;
export const now = Date.now;
export const to = v => typeof v; // renamed from to to avoid conflict with async.js
export const io = (i, c) => i instanceof c;
export const nn = v => v !== null && v !== undefined;
