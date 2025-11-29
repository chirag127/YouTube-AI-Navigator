export const d = document;
export const qs = (s, p = d) => p.querySelector(s);
export const qsa = (s, p = d) => p.querySelectorAll(s);
export const ce = t => d.createElement(t);
export const ael = (e, t, f, o) => e.addEventListener(t, f, o);
export const rel = (e, t, f, o) => e.removeEventListener(t, f, o);
export const ap = (p, c) => p.appendChild(c);
export const rm = e => e.remove();
