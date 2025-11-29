export const l = (m, ...a) => console.log(m, ...a);
export const w = (m, ...a) => console.warn(m, ...a);
export const e = (m, ...a) => console.error(m, ...a);
export const d = (m, ...a) => console.debug(m, ...a);
export const ce = (m, ...a) => console.error(m, ...a);
export const $ = (s, p = document) => p.querySelector(s);
export const $$ = (s, p = document) => [...p.querySelectorAll(s)];
export const _id = i => document.getElementById(i);
export const _cl = c => document.getElementsByClassName(c);
export const _tg = t => document.getElementsByTagName(t);
export const _cr = t => document.createElement(t);
export const _tx = t => document.createTextNode(t);
export const _on = (el, ev, fn) => el.addEventListener(ev, fn);
export const _off = (el, ev, fn) => el.removeEventListener(ev, fn);
export const rt = chrome.runtime;
export const sg = k => chrome.storage.sync.get(k);
export const ss = (k, v) => chrome.storage.sync.set(typeof k === 'string' ? { [k]: v } : k);
export const lg = k => chrome.storage.local.get(k);
export const ls = (k, v) => chrome.storage.local.set(typeof k === 'string' ? { [k]: v } : k);
export const url = p => chrome.runtime.getURL(p);
export const msg = (m, d) => chrome.runtime.sendMessage({ action: m, ...d });
export const tab = o => chrome.tabs.create(o);
export const js = o => JSON.stringify(o);
export const jp = s => JSON.parse(s);
export const jf = o => JSON.stringify(o, null, 2);
export const ft = async (u, o = {}, t = 5e3) => {
    try {
        const c = new AbortController(), i = setTimeout(() => c.abort(), t);
        const r = await fetch(u, { ...o, signal: c.signal });
        clearTimeout(i);
        return r.ok ? await r.json() : null;
    } catch (x) { w(`Fetch ${u}:`, x.message); return null; }
};
export const fj = async (u, o = {}) => {
    try { const r = await fetch(u, o); return r.ok ? await r.json() : null; }
    catch (x) { return null; }
};
export const ftx = async (u, o = {}) => {
    try { const r = await fetch(u, o); return r.ok ? await r.text() : null; }
    catch (x) { return null; }
};
export const sl = ms => new Promise(r => setTimeout(r, ms));
export const nt = () => Date.now();
export const tm = () => performance.now();
export const mp = (a, f) => a.map(f);
export const fl = (a, f) => a.filter(f);
export const rd = (a, f, i) => a.reduce(f, i);
export const fn = (a, f) => a.find(f);
export const sm = (a, f) => a.some(f);
export const ev = (a, f) => a.every(f);
export const fc = (a, f) => a.forEach(f);
export const sl2 = (a, s, n) => a.slice(s, n);
export const srt = (a, f) => a.sort(f);
export const ks = o => Object.keys(o);
export const vs = o => Object.values(o);
export const es = o => Object.entries(o);
export const as = (t, ...s) => Object.assign(t, ...s);
export const hk = (o, k) => Object.hasOwnProperty.call(o, k);
export const tr = s => s?.trim();
export const lc = s => s?.toLowerCase();
export const uc = s => s?.toUpperCase();
export const sp = (s, d) => s?.split(d);
export const jn = (a, d) => a?.join(d);
export const rp = (s, f, t) => s?.replace(f, t);
export const mt = (s, r) => s?.match(r);
export const inc = (s, t) => s?.includes(t);
export const sw = (s, t) => s?.startsWith(t);
export const ew = (s, t) => s?.endsWith(t);
export const up = u => new URL(u);
export const gp = (u, k) => new URL(u).searchParams.get(k);
export const sp2 = (u, k, v) => { const x = new URL(u); x.searchParams.set(k, v); return x.toString(); };
export const ch = (k, ttl) => {
    const c = {};
    return {
        g: () => c[k] && nt() - c[k].t < ttl ? c[k].v : null,
        s: v => c[k] = { v, t: nt() },
        c: () => delete c[k]
    };
};
export const tc = async (fn, fb = null) => { try { return await fn(); } catch (x) { e(x); return fb; } };
export const tcs = (fn, fb = null) => { try { return fn(); } catch (x) { e(x); return fb; } };
