// DOM utilities
export const qs = (s, p = document) => p.querySelector(s);
export const qsa = (s, p = document) => [...p.querySelectorAll(s)];
export const ge = i => document.getElementById(i);
export const gc = c => document.getElementsByClassName(c);
export const gt = t => document.getElementsByTagName(t);
export const cel = t => document.createElement(t); // renamed from cr to avoid conflict with chrome.runtime
export const ctx = t => document.createTextNode(t);
export const on = (e, v, f, o) => e.addEventListener(v, f, o);
export const off = (e, v, f, o) => e.removeEventListener(v, f, o);
export const ap = (p, c) => p.appendChild(c);
export const rmc = (p, c) => p.removeChild(c); // renamed from rm to avoid conflict
export const ac = (e, c) => e.classList.add(c);
export const rc = (e, c) => e.classList.remove(c);
export const tgl = (e, c) => e.classList.toggle(c);
export const hc = (e, c) => e.classList.contains(c);
export const sa = (e, k, v) => e.setAttribute(k, v);
export const ga = (e, k) => e.getAttribute(k);
export const ra = (e, k) => e.removeAttribute(k);
export const ih = (e, h) => (e.innerHTML = h);
export const tc = (e, t) => (e.textContent = t);
export const val = (e, v) => (v === undefined ? e.value : (e.value = v));
export const stl = (e, k, v) => (v === undefined ? e.style[k] : (e.style[k] = v));
export const show = e => (e.style.display = 'block');
export const hide = e => (e.style.display = 'none');
