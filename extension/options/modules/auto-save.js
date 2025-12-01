


import { oe } from '../../utils/shortcuts/core.js';
export class AutoSave {
  constructor(sm, d = 500, nm = null) {
    this.s = sm;
    this.d = d;
    this.t = null;
    this.n = nm;
    this.c = 0;
  }
  async save(p, v) {
    clearTimeout(this.t);
    if (this.n) this.n.saving('Saving...');
    this.t = setTimeout(async () => {
      try {
        await this.s.update(p, v);
        this.c++;
        if (this.n) this.n.success(`Setting saved: ${p.split('.').pop()}`);
        console.error(`[AutoSave] Saved ${p}`);
      } catch (x) {
        console.error(`[AutoSave] Failed to save ${p}:`, x);
        if (this.n) this.n.error(`Failed to save: ${x.message}`);
      }
    }, this.d);
  }
  trigger(cb) {
    clearTimeout(this.t);
    this.t = setTimeout(async () => {
      try {
        await cb();
      } catch (x) {
        console.error('[AutoSave] Error in triggered callback:', x);
      }
    }, this.d);
  }
  attachToInput(el, p, tr = v => v) {
    if (!el) return;
    const h = () => {
      try {
        const v = el.type === 'checkbox' ? el.checked : el.value;
        this.save(p, tr(v));
      } catch (x) {
        console.error('[AutoSave] Error in event handler:', x);
      }
    };
    (el)?.addEventListener('change', h);
    (el)?.addEventListener('input', h);
  }
  attachToAll(m) {
    oe(m).forEach(([id, c]) => {
      const el = (document).querySelector(c.selector || `#${id}`);
      if (el) {
        this.attachToInput(el, c.path, c.transform);
      } else {
        console.error(`[AutoSave] Element #${id} not found, skipping auto-save`);
      }
    });
  }
}
