import { ModelManager } from '../../api/gemini.js';

import { isS, jp, js, sw } from '../../utils/shortcuts/core.js';





export class AIConfig {
  constructor(s, a) {
    this.s = s;
    this.a = a;
    this.mm = null;
  }
  async init() {
    try {
      const c = this.s.get().ai || {};
      if (ModelManager && c.GAK)
        this.mm = new ModelManager(c.GAK, 'https://generativelanguage.googleapis.com/v1beta');
      this.set('ai-apiKey', c.GAK || '');
      this.set('ai-customPrompt', c.customPrompt || '');
      if (c.model) this.set('ai-modelSelect', c.model);
      const els = {
        ak: (document).querySelector('#ai-apiKey'),
        tak: (document).querySelector('#ai-toggleApiKey'),
        ms: (document).querySelector('#ai-modelSelect'),
        rm: (document).querySelector('#ai-refreshModels'),
        tc: (document).querySelector('#ai-testConnection'),
        cp: (document).querySelector('#ai-customPrompt'),
        sl: (document).querySelector('#ai-summaryLength'),
        mi: (document).querySelector('#ai-maxInsights'),
        mf: (document).querySelector('#ai-maxFAQ'),
        it: (document).querySelector('#ai-includeTimestamps'),
      };
      if (els.ak)
        (els.ak)?.addEventListener('change', async e => {
          const k = (e.target).value.trim();
          await sls('GAK', k);
          await this.a.save('ai.GAK', k);
          this.mm = new ModelManager(k, 'https://generativelanguage.googleapis.com/v1beta');
          if (k) await this.loadModels(els.ms);
        });
      if (els.tak)
        (els.tak)?.addEventListener('click', () => {
          els.ak.type = els.ak.type === 'password' ? 'text' : 'password';
        });
      if (els.cp) this.a.attachToInput(els.cp, 'ai.customPrompt');
      if (els.sl) {
        if (c.summaryLength) els.sl.value = c.summaryLength;
        (els.sl)?.addEventListener('change', e => this.a.save('ai.summaryLength', (e.target).value));
      }
      if (els.mi) {
        if (c.maxInsights) els.mi.value = c.maxInsights;
        this.a.attachToInput(els.mi, 'ai.maxInsights');
      }
      if (els.mf) {
        if (c.maxFAQ) els.mf.value = c.maxFAQ;
        this.a.attachToInput(els.mf, 'ai.maxFAQ');
      }
      if (els.it) {
        els.it.checked = c.includeTimestamps !== false;
        (els.it)?.addEventListener('change', e => this.a.save('ai.includeTimestamps', e.target.checked));
      }
      const temp = (document).querySelector('#ai-temperature');
      if (temp) {
        temp.value = c.temperature || 0.7;
        (temp)?.addEventListener('change', e => this.a.save('ai.temperature', parseFloat((e.target).value)));
      }
      const mt = (document).querySelector('#ai-maxTokens');
      if (mt) {
        mt.value = c.maxTokens || 8192;
        (mt)?.addEventListener('change', e => this.a.save('ai.maxTokens', parseInt((e.target).value)));
      }
      if (els.ms)
        (els.ms)?.addEventListener('change', e => {
          let m = (e.target).value;
          if (sw(m, 'models/')) m = m.replace('models/', '');
          this.a.save('ai.model', m);
        });
      if (els.rm) (els.rm)?.addEventListener('click', () => this.loadModels(els.ms));
      if (els.tc) (els.tc)?.addEventListener('click', () => this.test());
      if (c.apiKey) await this.loadModels(els.ms);
    } catch (err) {
      console.error('Err:AIConfig:Init', err);
    }
  }
  async loadModels(sel) {
    if (!sel) {
      return;
    }
    (sel).innerHTML = '<option value="" disabled>Loading...</option>';
    sel.disabled = true;
    try {
      if (!this.mm) throw new Error('Set API key first');
      const m = await this.mm.fetch();
      (sel).innerHTML = '';
      if (m.length === 0) {
        (sel).innerHTML = '<option value="" disabled>No models found</option>';
        return;
      }
      afe(m, x => {
        const n = isS(x) ? x.replace('models/', '') : x.name.replace('models/', '') || x;
        const o = document.createElement('option');
        o.value = n;
        (o).textContent = n;
        (sel)?.appendChild(o);
      });
      const c = this.s.get().ai || {};
      let s = c.model;
      if (s && sw(s, 'models/')) {
        s = s.replace('models/', '');
        await this.a.save('ai.model', s);
      }
      if (s && m.includes(s)) sel.value = s;
      else if (m.length > 0) {
        sel.value = m[0];
        await this.a.save('ai.model', m[0]);
      }
    } catch (x) {
      console.error('Err:LoadModels', x);
      (sel).innerHTML = '<option value="" disabled>Failed to load</option>';
      this.a.notifications?.error(`Failed: ${x.message}`);
    } finally {
      sel.disabled = false;
    }
  }
  async test() {
    const btn = (document).querySelector('#ai-testConnection'),
      st = (document).querySelector('#ai-apiStatus'),
      ms = (document).querySelector('#ai-modelSelect'),
      c = this.s.get().ai || {};
    btn.disabled = true;
    (btn).textContent = 'Testing...';
    st.className = 'status-indicator hidden';
    try {
      if (!c.GAK) throw new Error('API Key missing');
      let m = (ms).value || c.model || 'gemini-2.0-flash-exp';
      if (sw(m, 'models/')) m = m.replace('models/', '');
      if (
        !m.includes('-latest') &&
        !m.match(/-\d{3}$/) &&
        !m.match(/-\d{2}-\d{4}$/) &&
        !m.includes('preview') &&
        !m.includes('exp')
      )
        m += '-latest';
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${c.GAK}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: js({ contents: [{ parts: [{ text: 'Ping' }] }] }),
        }
      );
      if (!r.ok) {
        const err = jp(await r.text());
        throw new Error(err.error?.message || r.statusText);
      }
      (st).textContent = '✓ Connection Successful!';
      st.className = 'status-indicator success';
      (st)?.classList.remove('hidden');
      this.a.notifications?.success('API verified');
    } catch (x) {
      console.error('Err:Test', x);
      (st).textContent = `✗ Failed: ${x.message}`;
      st.className = 'status-indicator error';
      (st)?.classList.remove('hidden');
      this.a.notifications?.error(`Failed: ${x.message}`);
    } finally {
      btn.disabled = false;
      (btn).textContent = 'Test Connection';
    }
  }
  set(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (el) el.value = v;
  }
}
