export class UIManager {
  constructor() {
    this.elements = {};
  }
  async loadSection(id) {
    try {
      const r = await fetch(`sections/${id}.html`);
      return await r.text();
    } catch (x) {
      console.error(`Failed to load section ${id}:`, x);
      return `<div class="error">Failed to load section: ${id}</div>`;
    }
  }
  showToast(m, t = 'success') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = m;
    el.className = `toast show ${t}`;
    setTimeout(() => el.classList.remove('show'), 3000);
  }
  setupSections(cb) {
    const sections = Array.from(document.querySelectorAll('.nav-item'));
    sections.forEach(t => {
      t?.addEventListener('click', () => {
        const tgt = t.dataset.section;
        sections.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        Array.from(document.querySelectorAll('.section-content')).forEach(c =>
          c.classList.remove('active')
        );
        const s = document.getElementById(tgt);
        if (s) s.classList.add('active');
        if (cb) cb(tgt);
      });
    });
  }
}
