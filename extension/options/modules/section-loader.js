


import { pa } from '../../utils/shortcuts/async.js';
import { ok } from '../../utils/shortcuts/core.js';


export class SectionLoader {
  constructor() {
    this.sections = {
      general: 'sections/general.html',
      cache: 'sections/cache.html',
      transcript: 'sections/transcript.html',
      comments: 'sections/comments.html',
      metadata: 'sections/metadata.html',
      scroll: 'sections/scroll.html',
      widget: 'sections/widget.html',
      aiConfig: 'sections/ai-config.html',
      segments: 'sections/segments.html',
      performance: 'sections/performance.html',
      externalApis: 'sections/external-apis.html',
      integrations: 'sections/integrations.html',
      prompts: 'sections/prompts.html',
      notifications: 'sections/notifications.html',
      advanced: 'sections/advanced.html',
    };
    this.loaded = new Set();
  }
  async load(id) {
    if (this.loaded.has(id)) return true;
    const p = this.sections[id];
    if (!p) return false;
    try {
      const h = await fetch(chrome.runtime.getURL(`options/${p}`)).then(r => r.text());
      const c = $('.content-area');
      c.insertAdjacentHTML('beforeend', h);
      this.loaded.add(id);
      return true;
    } catch (x) {
      console.error(`[SectionLoader] Failed to load ${id}:`, x);
      return false;
    }
  }
  async loadAll() {
    await pa(ok(this.sections).map(id => this.load(id)));
  }
}
