const V = 1,
  E = 864e5;

export const videoCache = {
  async set(v, t, d) {
    const k = `vc_${v}_${t}`;
    await chrome.storage.local.set({ [k]: { v: V, t: Date.now(), d } });
  },
  async get(v, t) {
    const k = `vc_${v}_${t}`;
    const r = await chrome.storage.local.get(k);
    const c = r[k];
    if (c && c.v === V && Date.now() - c.t < E) return c.d;
    return null;
  },
  async clear(v) {
    const r = await chrome.storage.local.get(null);
    const k = Object.keys(r).filter(x => x.startsWith(`vc_${v}_`));
    await chrome.storage.local.remove(k);
  },
  async clearAll() {
    const r = await chrome.storage.local.get(null);
    const k = Object.keys(r).filter(x => x.startsWith('vc_'));
    await chrome.storage.local.remove(k);
  },
};
