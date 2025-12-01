


export class WidgetSettings {
  constructor(sm, nm) {
    this.sm = sm;
    this.nm = nm;
  }
  init() {
    try {
      this.loadSettings();
      this.attachListeners();
    } catch (err) {
      console.error('[WidgetSettings] Init error:', err);
    }
  }
  loadSettings() {
    try {
      const cfg = this.sm.get('widget') || {};
      const h = document.getElementById('widget-height');
      const mh = document.getElementById('widget-min-height');
      const xh = document.getElementById('widget-max-height');
      const w = document.getElementById('widget-width');
      const mw = document.getElementById('widget-min-width');
      const xw = document.getElementById('widget-max-width');
      const r = document.getElementById('widget-resizable');
      const rw = document.getElementById('widget-resizable-width');
      const pos = document.getElementById('widget-position');
      const op = document.getElementById('widget-opacity');
      const bl = document.getElementById('widget-blur');
      const sc = document.getElementById('widget-scale');
      const dh = document.getElementById('widget-dynamic-height');
      const vm = document.getElementById('widget-viewport-margin');
      const ts = document.getElementById('widget-tab-summary');
      const tg = document.getElementById('widget-tab-segments');
      const tc = document.getElementById('widget-tab-chat');
      const tm = document.getElementById('widget-tab-comments');
      const dc = document.getElementById('widget-default-collapsed');
      const rs = document.getElementById('widget-remember-state');
      const wop = document.getElementById('widgetOpacity');
      const wbr = document.getElementById('widgetBorderRadius');
      const wac = document.getElementById('widgetAccentColor');
      const whc = document.getElementById('widgetHideOnChannels');
      const wopv = document.getElementById('widgetOpacityValue');
      const wbrv = document.getElementById('widgetBorderRadiusValue');
      const wacv = document.getElementById('widgetAccentColorValue');

      // Segment type filters
      const ss = document.getElementById('widget-show-sponsor');
      const sp = document.getElementById('widget-show-selfpromo');
      const si = document.getElementById('widget-show-interaction');
      const sin = document.getElementById('widget-show-intro');
      const so = document.getElementById('widget-show-outro');
      const spr = document.getElementById('widget-show-preview');
      const sf = document.getElementById('widget-show-filler');
      const sh = document.getElementById('widget-show-highlight');
      const se = document.getElementById('widget-show-exclusive');

      if (h) h.value = cfg.height || 500;
      if (mh) mh.value = cfg.minHeight || 200;
      if (xh) xh.value = cfg.maxHeight || 1200;
      if (w) w.value = cfg.width || 400;
      if (mw) mw.value = cfg.minWidth || 300;
      if (xw) xw.value = cfg.maxWidth || 800;
      if (r) r.checked = cfg.resizable !== false;
      if (rw) rw.checked = cfg.resizableWidth === true;
      if (pos) pos.value = cfg.position || 'right';
      if (op) op.value = cfg.opacity || 95;
      if (bl) bl.value = cfg.blur || 12;
      if (sc) sc.value = cfg.scale || 100;
      if (dh) dh.checked = cfg.dynamicHeight !== false;
      if (vm) vm.value = cfg.viewportMargin || 20;
      if (ts) ts.checked = cfg.tabs?.summary !== false;
      if (tg) tg.checked = cfg.tabs?.segments !== false;
      if (tc) tc.checked = cfg.tabs?.chat !== false;
      if (tm) tm.checked = cfg.tabs?.comments !== false;
      if (dc) dc.checked = cfg.defaultCollapsed === true;
      if (rs) rs.checked = cfg.rememberState !== false;
      if (wop) {
        wop.value = cfg.opacity !== undefined ? cfg.opacity : 95;
        if (wopv) wopv.textContent = `${wop.value}%`;
      }
      if (wbr) {
        wbr.value = cfg.borderRadius !== undefined ? cfg.borderRadius : 12;
        if (wbrv) wbrv.textContent = `${wbr.value}px`;
      }
      if (wac) {
        wac.value = cfg.accentColor || '#3ea6ff';
        if (wacv) wacv.textContent = wac.value;
      }
      if (whc) whc.value = (cfg.hideOnChannels || []).join(', ');

      // Load segment filters (default to true)
      const filters = cfg.segmentFilters || {};
      if (ss) ss.checked = filters.sponsor !== false;
      if (sp) sp.checked = filters.selfpromo !== false;
      if (si) si.checked = filters.interaction !== false;
      if (sin) sin.checked = filters.intro !== false;
      if (so) so.checked = filters.outro !== false;
      if (spr) spr.checked = filters.preview !== false;
      if (sf) sf.checked = filters.filler !== false;
      if (sh) sh.checked = filters.highlight !== false;
      if (se) se.checked = filters.exclusive !== false;
    } catch (err) {
      console.error('[WidgetSettings] Load error:', err);
    }
  }
  attachListeners() {
    try {
      const h = document.getElementById('widget-height');
      const mh = document.getElementById('widget-min-height');
      const xh = document.getElementById('widget-max-height');
      const w = document.getElementById('widget-width');
      const mw = document.getElementById('widget-min-width');
      const xw = document.getElementById('widget-max-width');
      const r = document.getElementById('widget-resizable');
      const rw = document.getElementById('widget-resizable-width');
      const pos = document.getElementById('widget-position');
      const op = document.getElementById('widget-opacity');
      const bl = document.getElementById('widget-blur');
      const sc = document.getElementById('widget-scale');
      const dh = document.getElementById('widget-dynamic-height');
      const vm = document.getElementById('widget-viewport-margin');
      const ts = document.getElementById('widget-tab-summary');
      const tg = document.getElementById('widget-tab-segments');
      const tc = document.getElementById('widget-tab-chat');
      const tm = document.getElementById('widget-tab-comments');
      const dc = document.getElementById('widget-default-collapsed');
      const rs = document.getElementById('widget-remember-state');
      const wop = document.getElementById('widgetOpacity');
      const wbr = document.getElementById('widgetBorderRadius');
      const wac = document.getElementById('widgetAccentColor');
      const whc = document.getElementById('widgetHideOnChannels');
      const wopv = document.getElementById('widgetOpacityValue');
      const wbrv = document.getElementById('widgetBorderRadiusValue');
      const wacv = document.getElementById('widgetAccentColorValue');
      const rb = document.getElementById('widget-reset');

      // Segment filters
      const filters = [
        'sponsor',
        'selfpromo',
        'interaction',
        'intro',
        'outro',
        'preview',
        'filler',
        'highlight',
        'exclusive',
      ];

      if (h) (h)?.addEventListener('change', () => this.save());
      if (mh) (mh)?.addEventListener('change', () => this.save());
      if (xh) (xh)?.addEventListener('change', () => this.save());
      if (w) (w)?.addEventListener('change', () => this.save());
      if (mw) (mw)?.addEventListener('change', () => this.save());
      if (xw) (xw)?.addEventListener('change', () => this.save());
      if (r) (r)?.addEventListener('change', () => this.save());
      if (rw) (rw)?.addEventListener('change', () => this.save());
      if (pos) (pos)?.addEventListener('change', () => this.save());
      if (op) (op)?.addEventListener('change', () => this.save());
      if (bl) (bl)?.addEventListener('change', () => this.save());
      if (sc) (sc)?.addEventListener('change', () => this.save());
      if (dh) (dh)?.addEventListener('change', () => this.save());
      if (vm) (vm)?.addEventListener('change', () => this.save());
      if (ts) (ts)?.addEventListener('change', () => this.save());
      if (tg) (tg)?.addEventListener('change', () => this.save());
      if (tc) (tc)?.addEventListener('change', () => this.save());
      if (tm) (tm)?.addEventListener('change', () => this.save());
      if (dc) (dc)?.addEventListener('change', () => this.save());
      if (rs) (rs)?.addEventListener('change', () => this.save());
      if (wop) {
        (wop)?.addEventListener('input', e => {
          if (wopv) wopv.textContent = `${e.target.value}%`;
        });
        (wop)?.addEventListener('change', () => this.save());
      }
      if (wbr) {
        (wbr)?.addEventListener('input', e => {
          if (wbrv) wbrv.textContent = `${e.target.value}px`;
        });
        (wbr)?.addEventListener('change', () => this.save());
      }
      if (wac) {
        (wac)?.addEventListener('input', e => {
          if (wacv) wacv.textContent = e.target.value;
        });
        (wac)?.addEventListener('change', () => this.save());
      }
      if (whc) (whc)?.addEventListener('change', () => this.save());

      // Attach listeners for all segment filters
      filters.forEach(f => {
        const el = document.getElementById(`widget-show-${f}`);
        if (el) (el)?.addEventListener('change', () => this.save());
      });

      if (rb) (rb)?.addEventListener('click', () => this.reset());
    } catch (err) {
      console.error('[WidgetSettings] Attach listeners error:', err);
    }
  }
  async save() {
    try {
      const h = document.getElementById('widget-height');
      const mh = document.getElementById('widget-min-height');
      const xh = document.getElementById('widget-max-height');
      const w = document.getElementById('widget-width');
      const mw = document.getElementById('widget-min-width');
      const xw = document.getElementById('widget-max-width');
      const r = document.getElementById('widget-resizable');
      const rw = document.getElementById('widget-resizable-width');
      const pos = document.getElementById('widget-position');
      const op = document.getElementById('widget-opacity');
      const bl = document.getElementById('widget-blur');
      const sc = document.getElementById('widget-scale');
      const dh = document.getElementById('widget-dynamic-height');
      const vm = document.getElementById('widget-viewport-margin');
      const ts = document.getElementById('widget-tab-summary');
      const tg = document.getElementById('widget-tab-segments');
      const tc = document.getElementById('widget-tab-chat');
      const tm = document.getElementById('widget-tab-comments');
      const dc = document.getElementById('widget-default-collapsed');
      const rs = document.getElementById('widget-remember-state');

      this.sm.set('widget.height', parseInt(h?.value || 500));
      this.sm.set('widget.minHeight', parseInt(mh?.value || 200));
      this.sm.set('widget.maxHeight', parseInt(xh?.value || 1200));
      this.sm.set('widget.width', parseInt(w?.value || 400));
      this.sm.set('widget.minWidth', parseInt(mw?.value || 300));
      this.sm.set('widget.maxWidth', parseInt(xw?.value || 800));
      this.sm.set('widget.resizable', r?.checked !== false);
      this.sm.set('widget.resizableWidth', rw?.checked === true);
      this.sm.set('widget.position', pos?.value || 'right');
      this.sm.set('widget.opacity', parseInt(op?.value || 95));
      this.sm.set('widget.blur', parseInt(bl?.value || 12));
      this.sm.set('widget.scale', parseInt(sc?.value || 100));
      this.sm.set('widget.dynamicHeight', dh?.checked !== false);
      this.sm.set('widget.viewportMargin', parseInt(vm?.value || 20));
      this.sm.set('widget.tabs.summary', ts?.checked !== false);
      this.sm.set('widget.tabs.segments', tg?.checked !== false);
      this.sm.set('widget.tabs.chat', tc?.checked !== false);
      this.sm.set('widget.tabs.comments', tm?.checked !== false);
      this.sm.set('widget.defaultCollapsed', dc?.checked === true);
      this.sm.set('widget.rememberState', rs?.checked !== false);

      const wop = document.getElementById('widgetOpacity');
      const wbr = document.getElementById('widgetBorderRadius');
      const wac = document.getElementById('widgetAccentColor');
      const whc = document.getElementById('widgetHideOnChannels');

      this.sm.set('widget.opacity', parseInt(wop?.value || 95));
      this.sm.set('widget.borderRadius', parseInt(wbr?.value || 12));
      this.sm.set('widget.accentColor', wac?.value || '#3ea6ff');

      const channels = (whc?.value || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      this.sm.set('widget.hideOnChannels', channels);

      // Save segment filters
      const filters = {
        sponsor: document.getElementById('widget-show-sponsor')?.checked !== false,
        selfpromo: document.getElementById('widget-show-selfpromo')?.checked !== false,
        interaction: document.getElementById('widget-show-interaction')?.checked !== false,
        intro: document.getElementById('widget-show-intro')?.checked !== false,
        outro: document.getElementById('widget-show-outro')?.checked !== false,
        preview: document.getElementById('widget-show-preview')?.checked !== false,
        filler: document.getElementById('widget-show-filler')?.checked !== false,
        highlight: document.getElementById('widget-show-highlight')?.checked !== false,
        exclusive: document.getElementById('widget-show-exclusive')?.checked !== false,
      };
      this.sm.set('widget.segmentFilters', filters);

      await this.sm.save();
      this.nm.show('Widget settings saved', 'success');
    } catch (err) {
      console.error('[WidgetSettings] Save error:', err);
      this.nm.show('Failed to save widget settings', 'error');
    }
  }
  async reset() {
    try {
      this.sm.set('widget', {
        height: 500,
        minHeight: 200,
        maxHeight: 1200,
        width: 400,
        minWidth: 300,
        maxWidth: 800,
        resizable: true,
        resizableWidth: false,
        position: 'right',
        opacity: 95,
        blur: 12,
        scale: 100,
        dynamicHeight: true,
        viewportMargin: 20,
        tabs: { summary: true, segments: true, chat: true, comments: true },
        defaultCollapsed: false,
        rememberState: true,
        segmentFilters: {
          sponsor: true,
          selfpromo: true,
          interaction: true,
          intro: true,
          outro: true,
          preview: true,
          filler: true,
          highlight: true,
          exclusive: true,
        },

        borderRadius: 12,
        accentColor: '#3ea6ff',
        hideOnChannels: [],
      });
      await this.sm.save();
      this.loadSettings();
      this.nm.show('Widget settings reset to defaults', 'success');
    } catch (err) {
      console.error('[WidgetSettings] Reset error:', err);
      this.nm.show('Failed to reset widget settings', 'error');
    }
  }
}
