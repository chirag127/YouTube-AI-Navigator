

import { nw as nt, jp, js, lc } from '../../utils/shortcuts/core.js';

export class ComprehensiveHistory {
  constructor() {
    this.k = 'comprehensive_history';
    this.m = 100;
  }
  async save(v, d) {
    const n = {
      videoId: v,
      timestamp: nt(),
      url: `https://www.youtube.com/watch?v=${v}`,
      metadata: d.metadata || {},
      transcript: d.transcript || [],
      comments: { raw: d.comments || [], analysis: d.commentAnalysis || null },
      segments: { detected: d.segments || [], actions: d.segmentActions || {} },
      analysis: {
        summary: d.summary || null,
        comprehensive: d.comprehensiveReview || null,
        faq: d.faq || null,
        keyPoints: d.keyPoints || [],
      },
      chatHistory: d.chatHistory || [],
      userActions: {
        liked: d.liked || false,
        watched: d.watchPercentage || 0,
        skippedSegments: d.skippedSegments || [],
      },
    };
    const h = await this.getAll(),
      f = h.filter(x => x.videoId !== v);
    [...new Set(f)];
    const t = slc(f, 0, this.m);
    await chrome.storage.local.set({ [this.k]: t });

    return n;
  }
  async get(v) {
    const h = await this.getAll();
    return h.find(x => x.videoId === v);
  }
  async getAll() {
    const r = await chrome.storage.local.get(this.k);
    return r[this.k] || [];
  }
  async delete(v) {
    const h = await this.getAll(),
      f = h.filter(x => x.videoId !== v);
    await chrome.storage.local.set({ [this.k]: f });
  }
  async clear() {
    await chrome.storage.local.remove(this.k);
  }
  async search(q) {
    const h = await this.getAll(),
      lq = lc(q);
    return h.filter(e =>
        (e.metadata?.title && inc(lc(e.metadata.title), lq)) ||
        (e.metadata?.author && inc(lc(e.metadata.author), lq)) ||
        inc(e.videoId, lq));
  }
  async getStats() {
    const h = await this.getAll();
    return {
      totalVideos: h.length,
      totalTranscripts: h.filter(x => x.transcript?.length > 0).length,
      totalComments: h.filter(x => x.comments?.raw?.length > 0).length,
      totalSegments: h.filter(x => x.segments?.detected?.length > 0).length,
      totalAnalyses: h.filter(x => x.analysis?.summary).length,
      storageSize: js(h).length,
    };
  }
  async export() {
    const h = await this.getAll();
    return js(h, null, 2);
  }
  async import(j) {
    try {
      const i = jp(j);
      if (!Array.isArray(i)) throw new Error('Invalid format');
      await chrome.storage.local.set({ [this.k]: i });
      return true;
    } catch (x) {
      console.error('[History] Import failed:', x);
      return false;
    }
  }
}
let i = null;
export function getHistory() {
  if (!i) i = new ComprehensiveHistory();
  return i;
}
