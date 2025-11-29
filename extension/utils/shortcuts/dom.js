export const d = document;
export const $ = (s, r = d) => r.querySelector(s);
export const $$ = (s, r = d) => r.querySelectorAll(s);
export const qa = (s, r = d) => [...r.querySelectorAll(s)];
export const id = i => d.getElementById(i);
export const ce = t => d.createElement(t);
export const tx = t => d.createTextNode(t);
export const ap = (p, c) => p.appendChild(c);
export const rm = e => e?.remove();
export const tc = (e, t) => (t === undefined ? e.textContent : (e.textContent = t));
export const ih = (e, h) => (h === undefined ? e.innerHTML : (e.innerHTML = h));
export const vl = (e, v) => (v === undefined ? e.value : (e.value = v));
export const rc = (e, c) => e.classList.remove(c);
export const ac = (e, c) => e.classList.add(c);
export const tg = (e, c) => e.classList.toggle(c);
export const hc = (e, c) => e.classList.contains(c);
export const on = (e, t, f, o) => e.addEventListener(t, f, o);
export const of = (e, t, f, o) => e.removeEventListener(t, f, o);
export const fc = e => e.firstChild;
export const vs = (e, v) => (e.style.display = v ? '' : 'none');
export const fe = (n, f) => n.forEach(f);
export const wfe = (s, t = 10000) =>
  new Promise((r, j) => {
    const e = $(s);
    if (e) return r(e);
    const o = new MutationObserver(() => {
      const e = $(s);
      if (e) {
        o.disconnect();
        r(e);
      }
    });
    o.observe(d.body, { childList: true, subtree: true });
    setTimeout(() => {
      o.disconnect();
      j(new Error(`TO: ${s}`));
    }, t);
  });
