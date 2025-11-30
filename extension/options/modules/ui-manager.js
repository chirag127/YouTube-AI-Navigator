import { ft } from '../../utils/shortcuts/network.js';
import { id as i, $$, on, ce } from '../../utils/shortcuts/dom.js';
import { to as st } from '../../utils/shortcuts/global.js';

export class UIManager {
  constructor() {
    this.elements = {};
  }
  async loadSection(id) {
    try {
      const r = await ft(`sections/${id}.html`);
      return await r.text();
    } catch (x) {
      ce(`Failed to load section ${id}:`, x);
      return `<div class="error">Failed to load section: ${id}</div>`;
    }
  }
  showToast(m, t = 'success') {
    const el = i('toast');
    if (!el) return;
    el.textContent = m;
    el.className = `toast show ${t}`;
    st(() => el.classList.remove('show'), 3000);
  }
  setupTabs(cb) {
    const tabs = $$('.nav-item');
    tabs.forEach(t => {
      on(t, 'click', () => {
        const tgt = t.dataset.tab;
        tabs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        $$('.tab-content').forEach(c => c.classList.remove('active'));
        const s = i(tgt);
        if (s) s.classList.add('active');
        if (cb) cb(tgt);
      });
    });
  }
}




