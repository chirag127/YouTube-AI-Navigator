import { id, on } from '../../utils/shortcuts/dom.js';
import { e } from '../../utils/shortcuts/log.js';

export class UIAppearance {
  constructor(sm, as) {
    this.sm = sm;
    this.as = as;
  }

  init() {
    try {
      this.loadSettings();
      this.attachListeners();
    } catch (err) {
      e('[UIAppearance] Init error:', err);
    }
  }

  loadSettings() {
    try {
      const c = this.sm.get('ui') || {};
      const ff = id('uiFontFamily');
      const is = id('uiIconStyle');
      const wm = id('uiWallpaperMode');
      const cm = id('uiCompactMode');
      const pc = id('uiPrimaryColor');
      const ac = id('uiAccentColor');
      const bc = id('uiBackgroundColor');
      const tc = id('uiTextColor');
      const boc = id('uiBorderColor');

      if (ff) ff.value = c.fontFamily || 'Inter';
      if (is) is.value = c.iconStyle || 'default';
      if (wm) wm.checked = c.wallpaperMode ?? false;
      if (cm) cm.checked = c.compactMode ?? false;
      if (pc) pc.value = c.primaryColor || '#00f3ff';
      if (ac) ac.value = c.accentColor || '#bc13fe';
      if (bc) bc.value = c.backgroundColor || '#000000';
      if (tc) tc.value = c.textColor || '#ffffff';
      if (boc) boc.value = c.borderColor || '#ffffff';
    } catch (err) {
      e('[UIAppearance] Load error:', err);
    }
  }

  attachListeners() {
    try {
      const ff = id('uiFontFamily');
      const is = id('uiIconStyle');
      const wm = id('uiWallpaperMode');
      const cm = id('uiCompactMode');
      const pc = id('uiPrimaryColor');
      const ac = id('uiAccentColor');
      const bc = id('uiBackgroundColor');
      const tc = id('uiTextColor');
      const boc = id('uiBorderColor');

      if (ff) on(ff, 'change', e => this.as.save('ui.fontFamily', e.target.value));
      if (is) on(is, 'change', e => this.as.save('ui.iconStyle', e.target.value));
      if (wm) on(wm, 'change', e => this.as.save('ui.wallpaperMode', e.target.checked));
      if (cm) on(cm, 'change', e => this.as.save('ui.compactMode', e.target.checked));
      if (pc) on(pc, 'change', e => this.as.save('ui.primaryColor', e.target.value));
      if (ac) on(ac, 'change', e => this.as.save('ui.accentColor', e.target.value));
      if (bc) on(bc, 'change', e => this.as.save('ui.backgroundColor', e.target.value));
      if (tc) on(tc, 'change', e => this.as.save('ui.textColor', e.target.value));
      if (boc) on(boc, 'change', e => this.as.save('ui.borderColor', e.target.value));
    } catch (err) {
      e('[UIAppearance] Attach listeners error:', err);
    }
  }
}
