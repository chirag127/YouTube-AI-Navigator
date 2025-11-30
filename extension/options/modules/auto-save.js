import { e } from '../../utils/shortcuts/log.js';
import { to, clt } from '../../utils/shortcuts/global.js';
import { on, qs as i } from '../../utils/shortcuts/dom.js';
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
    clt(this.t);
    if (this.n) this.n.saving('Saving...');
    this.t = to(async () => {
      try {
        await this.s.update(p, v);
        this.c++;
        if (this.n) this.n.success(`Setting saved: ${p.split('.').pop()}`);
        e(`[AutoSave] Saved ${p}`);
      } catch (x) {
        e(`[AutoSave] Failed to save ${p}:`, x);
        if (this.n) this.n.error(`Failed to save: ${x.message}`);
      }
    }, this.d);
  }
  trigger(cb) {
    clt(this.t);
    this.t = to(async () => {
      try {
        await cb();
      } catch (x) {
        e('[AutoSave] Error in triggered callback:', x);
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
        e('[AutoSave] Error in event handler:', x);
      }
    };
    on(el, 'change', h);
    on(el, 'input', h);
  }
  attachToAll(m) {
    oe(m).forEach(([id, c]) => {
      const el = i(`#${id}`);
      if (el) {
        this.attachToInput(el, c.path, c.transform);
      } else {
        e(`[AutoSave] Element #${id} not found, skipping auto-save`);
      }
    });
  }
}
