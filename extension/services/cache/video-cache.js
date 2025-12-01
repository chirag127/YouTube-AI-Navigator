
import { nw as nt, ok as keys } from '../../utils/shortcuts/core.js';

const V = 1,
  E = 86400000;
class VideoCache {
  constructor() {
    this.m = new Map();
  }
  async get(id, t) {
    const k = `${id}:${t}`;
    if (this.m.has(k)) {
      const c = this.m.get(k);
      if (nt() - c.ts < E) {
        return c.d;
      }
      this.m.delete(k);
    }
    const sk = `video_${id}_${t}`,
      r = await chrome.storage.local.get(sk);
    if (r[sk]) {
      const c = r[sk];
      if (c.v === V && nt() - c.ts < E) {
        this.m.set(k, { d: c.d, ts: c.ts });
        return c.d;
      }
      await chrome.storage.local.remove(sk);
    }
    return null;
  }
  async set(id, t, d) {
    const k = `${id}:${t}`,
      sk = `video_${id}_${t}`,
      ts = nt();
    this.m.set(k, { d, ts });
    await chrome.storage.local.get({ [sk]: { v: V, ts, d } });
  }
  async clear(id) {
    if (id) {
      const ks = ['metadata', 'transcript', 'comments'];
      for (const t of ks) {
        this.m.delete(`${id}:${t}`);
        await chrome.storage.local.remove(`video_${id}_${t}`);
      }
    } else {
      this.m.clear();
      const a = await chrome.storage.local.get(null),
        vk = keys(a).filter(k => k.startsWith('video_'));
      await chrome.storage.local.remove(vk);
    }
  }
}
export const videoCache = new VideoCache();
