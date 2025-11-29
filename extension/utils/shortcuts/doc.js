export const qs = (s, r = document) => r.querySelector(s);
export const qsa = (s, r = document) => r.querySelectorAll(s);
export const qa = (s, r = document) => [...r.querySelectorAll(s)];
export const ce = (t) => document.createElement(t);
export const gebi = (i) => document.getElementById(i);
