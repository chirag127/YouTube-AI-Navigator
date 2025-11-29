export const l = (m, ...a) => console.log(m, ...a);
export const w = (m, ...a) => console.warn(m, ...a);
export const e = (m, ...a) => console.error(m, ...a);
export const d = (m, ...a) => console.debug(m, ...a);
export const i = (m, ...a) => console.info(m, ...a);
export const cl = l; export const cw = w; export const ce = e; export const cd = d; export const ci = i;
export const $ = (s, p = document) => p.querySelector(s);
export const $$ = (s, p = document) => [...p.querySelectorAll(s)];
export const qs = $; export const qsa = $$;
export const ge = i => document.getElementById(i);
export const _id = ge;
export const gc = c => document.getElementsByClassName(c);
export const _cl = gc;
export const gt = t => document.getElementsByTagName(t);
export const _tg = gt;
export const gn = n => document.getElementsByName(n);
export const cr = t => document.createElement(t);
export const _cr = cr;
export const ctx = t => document.createTextNode(t);
export const _tx = ctx;
export const on = (el, ev, fn, o) => el.addEventListener(ev, fn, o);
export const _on = on;
export const off = (el, ev, fn, o) => el.removeEventListener(ev, fn, o);
export const _off = off;
export const ap = (p, c) => p.appendChild(c);
export const rm = (p, c) => p.removeChild(c);
export const ac = (el, c) => el.classList.add(c);
export const rc = (el, c) => el.classList.remove(c);
export const tgl = (el, c) => el.classList.toggle(c);
export const hc = (el, c) => el.classList.contains(c);
export const sa = (el, k, v) => el.setAttribute(k, v);
export const ga = (el, k) => el.getAttribute(k);
export const ra = (el, k) => el.removeAttribute(k);
export const ha = (el, k) => el.hasAttribute(k);
export const rt = chrome.runtime;
export const sg = k => chrome.storage.sync.get(k);
export const ss = (k, v) => chrome.storage.sync.set(typeof k === 'string' ? { [k]: v } : k);
export const lg = k => chrome.storage.local.get(k);
export const ls = (k, v) => chrome.storage.local.set(typeof k === 'string' ? { [k]: v } : k);
export const sr = k => chrome.storage.sync.remove(k);
export const lr = k => chrome.storage.local.remove(k);
export const scl = () => chrome.storage.sync.clear();
export const lcl = () => chrome.storage.local.clear();
export const url = p => chrome.runtime.getURL(p);
export const msg = (m, d) => chrome.runtime.sendMessage({ action: m, ...d });
export const tab = o => chrome.tabs.create(o);
export const tq = (q, cb) => chrome.tabs.query(q, cb);
export const tsm = (id, m, cb) => chrome.tabs.sendMessage(id, m, cb);
export const js = o => JSON.stringify(o);
export const jp = s => JSON.parse(s);
export const jf = o => JSON.stringify(o, null, 2);
export const jstr = jf; export const jpar = jp;
export const ks = o => Object.keys(o);
export const vs = o => Object.values(o);
export const es = o => Object.entries(o);
export const as = (t, ...s) => Object.assign(t, ...s);
export const oa = as;
export const hk = (o, k) => Object.hasOwnProperty.call(o, k);
export const hp = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
export const fr = (o, e) => Object.fromEntries(e);
export const mp = (a, f) => a.map(f);
export const fl = (a, f) => a.filter(f);
export const rd = (a, f, i) => a.reduce(f, i);
export const fn = (a, f) => a.find(f);
export const fi = (a, f) => a.findIndex(f);
export const sm = (a, f) => a.some(f);
export const ev = (a, f) => a.every(f);
export const fc = (a, f) => a.forEach(f);
export const slc = (a, s, n) => a.slice(s, n);
export const srt = (a, f) => a.sort(f);
export const rv = a => a.reverse();
export const jn = (a, d = '') => a.join(d);
export const ps = (a, ...i) => a.push(...i);
export const pp = a => a.pop();
export const sh = a => a.shift();
export const us = (a, ...i) => a.unshift(...i);
export const spl = (a, s, d, ...i) => a.splice(s, d, ...i);
export const inc = (a, v, s) => a.includes(v, s);
export const io = (a, v, s) => a.indexOf(v, s);
export const lo = (a, v, s) => a.lastIndexOf(v, s);
export const tr = s => s?.trim();
export const lc = s => s?.toLowerCase();
export const uc = s => s?.toUpperCase();
export const spt = (s, d) => s?.split(d);
export const rp = (s, f, t) => s?.replace(f, t);
export const rpa = (s, f, t) => s?.replaceAll(f, t);
export const mt = (s, r) => s?.match(r);
export const ma = (s, r) => s?.matchAll(r);
export const sw = (s, t) => s?.startsWith(t);
export const ew = (s, t) => s?.endsWith(t);
export const sbs = (s, i, e) => s?.substring(i, e);
export const sbr = (s, i, l) => s?.substr(i, l);
export const cc = (s, i) => s?.charCodeAt(i);
export const ca = (s, i) => s?.charAt(i);
export const pd = (s, l, c = ' ') => s?.padStart(l, c);
export const pe = (s, l, c = ' ') => s?.padEnd(l, c);
export const rpt = (s, n) => s?.repeat(n);
export const up = u => new URL(u);
export const gp = (u, k) => new URL(u).searchParams.get(k);
export const spu = (u, k, v) => { const x = new URL(u); x.searchParams.set(k, v); return x.toString(); };
export const apu = (u, k, v) => { const x = new URL(u); x.searchParams.append(k, v); return x.toString(); };
export const dpu = (u, k) => { const x = new URL(u); x.searchParams.delete(k); return x.toString(); };
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
export const fb = async (u, o = {}) => {
    try { const r = await fetch(u, o); return r.ok ? await r.blob() : null; }
    catch (x) { return null; }
};
export const fa = async (u, o = {}) => {
    try { const r = await fetch(u, o); return r.ok ? await r.arrayBuffer() : null; }
    catch (x) { return null; }
};
export const safeFetch = ft;
export const sl = ms => new Promise(r => setTimeout(r, ms));
export const sleep = sl;
export const nt = () => Date.now();
export const pnow = () => performance.now();
export const si = (fn, ms) => setInterval(fn, ms);
export const csi = id => clearInterval(id);
export const st = (fn, ms) => setTimeout(fn, ms);
export const cst = id => clearTimeout(id);
export const raf = fn => requestAnimationFrame(fn);
export const caf = id => cancelAnimationFrame(id);
export const ch = (k, ttl) => {
    const c = {};
    return {
        g: () => c[k] && nt() - c[k].t < ttl ? c[k].v : null,
        s: v => c[k] = { v, t: nt() },
        c: () => delete c[k],
        h: () => !!c[k]
    };
};
export const tryc = async (fn, fb = null) => { try { return await fn(); } catch (x) { e(x); return fb; } };
export const trycs = (fn, fb = null) => { try { return fn(); } catch (x) { e(x); return fb; } };
export const prom = (r, v) => new Promise(r);
export const pa = ps => Promise.all(ps);
export const prc = ps => Promise.race(ps);
export const pas = ps => Promise.allSettled(ps);
export const pany = ps => Promise.any(ps);
export const prs = v => Promise.resolve(v);
export const prj = e => Promise.reject(e);
export const mn = (a, b) => Math.min(a, b);
export const mx = (a, b) => Math.max(a, b);
export const mfl = n => Math.floor(n);
export const mcl = n => Math.ceil(n);
export const rnd = n => Math.round(n);
export const abs = n => Math.abs(n);
export const pw = (b, e) => Math.pow(b, e);
export const sq = n => Math.sqrt(n);
export const rndm = () => Math.random();
export const pi = Math.PI;
export const e2 = Math.E;
export const isA = v => Array.isArray(v);
export const isO = v => typeof v === 'object' && v !== null;
export const isS = v => typeof v === 'string';
export const isN = v => typeof v === 'number';
export const isB = v => typeof v === 'boolean';
export const isF = v => typeof v === 'function';
export const isU = v => typeof v === 'undefined';
export const isNl = v => v === null;
export const isNn = v => v != null;
export const isNaN2 = v => Number.isNaN(v);
export const isFin = v => Number.isFinite(v);
export const isInt = v => Number.isInteger(v);
export const pI = s => parseInt(s, 10);
export const pF = s => parseFloat(s);
export const nv = v => Number(v);
export const bv = v => Boolean(v);
export const sv = v => String(v);
export const enc = s => encodeURIComponent(s);
export const dec = s => decodeURIComponent(s);
export const b64e = s => btoa(s);
export const b64d = s => atob(s);
export const loc = window.location;
export const nav = window.navigator;
export const doc = document;
export const win = window;
export const his = window.history;
export const lsto = window.localStorage;
export const ssto = window.sessionStorage;
