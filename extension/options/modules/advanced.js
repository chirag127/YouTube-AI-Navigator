
import { jp, js } from '../../utils/shortcuts/core.js';


export class AdvancedSettings {
  constructor(s, a) {
    this.s = s;
    this.a = a;
  }
  init() {
    this.chk('debugMode', this.s.get().advanced?.debugMode ?? false);
    this.chk('enableTelemetry', this.s.get().advanced?.enableTelemetry ?? false);
    this.set('maxHistory', this.s.get().advanced?.maxHistory || 100);
    this.a.attachToAll({
      debugMode: { path: 'advanced.debugMode' },
      enableTelemetry: { path: 'advanced.enableTelemetry' },
      maxHistory: { path: 'advanced.maxHistory', transform: v => parseInt(v) },
    });
    const els = {
      ex: (document).querySelector('#exportSettings'),
      im: (document).querySelector('#importSettings'),
      if: (document).querySelector('#importFile'),
      rd: (document).querySelector('#resetDefaults'),
    };
    if (els.ex)
      (els.ex)?.addEventListener('click', () => {
        const d = js(this.s.get(), null, 2);
        const b = new Blob([d], { type: 'application/json' });
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = 'youtube-ai-master-settings.json';
        a.click();
      });
    if (els.im) (els.im)?.addEventListener('click', () => els.if?.click());
    if (els.if)
      (els.if)?.addEventListener('change', e => {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = async ev => {
          try {
            const i = jp(ev.target.result);
            if (await this.s.import(js(i))) {
              this.a.notifications?.success('Settings imported');
              setTimeout(() => window.location.reload(), 1000);
            } else throw new Error('Import failed');
          } catch (x) {
            console.error('Import failed:', x);
            this.a.notifications?.error('Invalid settings file');
          }
        };
        r.readAsText(f);
      });
    if (els.rd)
      (els.rd)?.addEventListener('click', async () => {
        if (confirm('Reset all settings to default? This cannot be undone.')) {
          await this.s.reset();
          this.a.notifications?.success('Settings reset');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
  }
  chk(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (el) el.checked = v;
  }
}
