


export class UIAppearance {
  constructor(sm, as) {
    this.sm = sm;
    this.as = as;
  }

  init() {
    try {
      this.loadSettings();
      this.attachListeners();
      this.applyStyles();
    } catch (err) {
      console.error('[UIAppearance] Init error:', err);
    }
  }

  loadSettings() {
    try {
      const c = this.sm.get('ui') || {};
      const ff = document.getElementById('uiFontFamily');
      const is = document.getElementById('uiIconStyle');
      const wm = document.getElementById('uiWallpaperMode');
      const cm = document.getElementById('uiCompactMode');
      const pc = document.getElementById('uiPrimaryColor');
      const ac = document.getElementById('uiAccentColor');
      const bc = document.getElementById('uiBackgroundColor');
      const tc = document.getElementById('uiTextColor');
      const boc = document.getElementById('uiBorderColor');
      const gb = document.getElementById('uiGlassBlur');
      const co = document.getElementById('uiCardOpacity');
      const as = document.getElementById('uiAnimationSpeed');
      const ec = document.getElementById('uiEasingCurve');
      const mi = document.getElementById('uiMicroInteractions');
      const bw = document.getElementById('uiBorderWidth');
      const rs = document.getElementById('uiRadiusScale');
      const ss = document.getElementById('uiSpacingScale');
      const si = document.getElementById('uiShadowIntensity');
      const gi = document.getElementById('uiGlowIntensity');
      const ga = document.getElementById('uiGradientAccents');

      if (ff) ff.value = c.fontFamily || 'Inter';
      if (is) is.value = c.iconStyle || 'default';
      if (wm) wm.checked = c.wallpaperMode ?? false;
      if (cm) cm.checked = c.compactMode ?? false;
      if (pc) pc.value = c.primaryColor || '#00f3ff';
      if (ac) ac.value = c.accentColor || '#bc13fe';
      if (bc) bc.value = c.backgroundColor || '#000000';
      if (tc) tc.value = c.textColor || '#ffffff';
      if (boc) boc.value = c.borderColor || '#ffffff';
      if (gb) {
        gb.value = c.glassBlur ?? 32;
        const v = document.getElementById('uiGlassBlurValue');
        if (v) v.textContent = `${gb.value}px`;
      }
      if (co) {
        co.value = c.cardOpacity ?? 60;
        const v = document.getElementById('uiCardOpacityValue');
        if (v) v.textContent = `${co.value}%`;
      }
      if (as) {
        as.value = c.animationSpeed ?? 0.2;
        const v = document.getElementById('uiAnimationSpeedValue');
        if (v) v.textContent = `${as.value}s`;
      }
      if (ec) ec.value = c.easingCurve || 'cubic-bezier(0.4, 0, 0.2, 1)';
      if (mi) mi.checked = c.microInteractions ?? true;
      if (bw) {
        bw.value = c.borderWidth ?? 2;
        const v = document.getElementById('uiBorderWidthValue');
        if (v) v.textContent = `${bw.value}px`;
      }
      if (rs) {
        rs.value = c.radiusScale ?? 1;
        const v = document.getElementById('uiRadiusScaleValue');
        if (v) v.textContent = `${rs.value}x`;
      }
      if (ss) {
        ss.value = c.spacingScale ?? 1;
        const v = document.getElementById('uiSpacingScaleValue');
        if (v) v.textContent = `${ss.value}x`;
      }
      if (si) {
        si.value = c.shadowIntensity ?? 60;
        const v = document.getElementById('uiShadowIntensityValue');
        if (v) v.textContent = `${si.value}%`;
      }
      if (gi) {
        gi.value = c.glowIntensity ?? 40;
        const v = document.getElementById('uiGlowIntensityValue');
        if (v) v.textContent = `${gi.value}%`;
      }
      if (ga) ga.checked = c.gradientAccents ?? true;
    } catch (err) {
      console.error('[UIAppearance] Load error:', err);
    }
  }

  attachListeners() {
    try {
      const ff = document.getElementById('uiFontFamily');
      const is = document.getElementById('uiIconStyle');
      const wm = document.getElementById('uiWallpaperMode');
      const cm = document.getElementById('uiCompactMode');
      const pc = document.getElementById('uiPrimaryColor');
      const ac = document.getElementById('uiAccentColor');
      const bc = document.getElementById('uiBackgroundColor');
      const tc = document.getElementById('uiTextColor');
      const boc = document.getElementById('uiBorderColor');
      const gb = document.getElementById('uiGlassBlur');
      const co = document.getElementById('uiCardOpacity');
      const as = document.getElementById('uiAnimationSpeed');
      const ec = document.getElementById('uiEasingCurve');
      const mi = document.getElementById('uiMicroInteractions');
      const bw = document.getElementById('uiBorderWidth');
      const rs = document.getElementById('uiRadiusScale');
      const ss = document.getElementById('uiSpacingScale');
      const si = document.getElementById('uiShadowIntensity');
      const gi = document.getElementById('uiGlowIntensity');
      const ga = document.getElementById('uiGradientAccents');

      if (ff) (ff)?.addEventListener('change', e => this.handleChange('ui.fontFamily', e.target.value));
      if (is) (is)?.addEventListener('change', e => this.handleChange('ui.iconStyle', e.target.value));
      if (wm) (wm)?.addEventListener('change', e => this.handleChange('ui.wallpaperMode', e.target.checked));
      if (cm) (cm)?.addEventListener('change', e => this.handleChange('ui.compactMode', e.target.checked));
      if (pc) (pc)?.addEventListener('change', e => this.handleChange('ui.primaryColor', e.target.value));
      if (ac) (ac)?.addEventListener('change', e => this.handleChange('ui.accentColor', e.target.value));
      if (bc) (bc)?.addEventListener('change', e => this.handleChange('ui.backgroundColor', e.target.value));
      if (tc) (tc)?.addEventListener('change', e => this.handleChange('ui.textColor', e.target.value));
      if (boc) (boc)?.addEventListener('change', e => this.handleChange('ui.borderColor', e.target.value));
      if (gb) {
        (gb)?.addEventListener('input', e => {
          const v = document.getElementById('uiGlassBlurValue');
          if (v) v.textContent = `${e.target.value}px`;
        });
        (gb)?.addEventListener('change', e => this.handleChange('ui.glassBlur', +e.target.value));
      }
      if (co) {
        (co)?.addEventListener('input', e => {
          const v = document.getElementById('uiCardOpacityValue');
          if (v) v.textContent = `${e.target.value}%`;
        });
        (co)?.addEventListener('change', e => this.handleChange('ui.cardOpacity', +e.target.value));
      }
      if (as) {
        (as)?.addEventListener('input', e => {
          const v = document.getElementById('uiAnimationSpeedValue');
          if (v) v.textContent = `${e.target.value}s`;
        });
        (as)?.addEventListener('change', e => this.handleChange('ui.animationSpeed', +e.target.value));
      }
      if (ec) (ec)?.addEventListener('change', e => this.handleChange('ui.easingCurve', e.target.value));
      if (mi) (mi)?.addEventListener('change', e => this.handleChange('ui.microInteractions', e.target.checked));
      if (bw) {
        (bw)?.addEventListener('input', e => {
          const v = document.getElementById('uiBorderWidthValue');
          if (v) v.textContent = `${e.target.value}px`;
        });
        (bw)?.addEventListener('change', e => this.handleChange('ui.borderWidth', +e.target.value));
      }
      if (rs) {
        (rs)?.addEventListener('input', e => {
          const v = document.getElementById('uiRadiusScaleValue');
          if (v) v.textContent = `${e.target.value}x`;
        });
        (rs)?.addEventListener('change', e => this.handleChange('ui.radiusScale', +e.target.value));
      }
      if (ss) {
        (ss)?.addEventListener('input', e => {
          const v = document.getElementById('uiSpacingScaleValue');
          if (v) v.textContent = `${e.target.value}x`;
        });
        (ss)?.addEventListener('change', e => this.handleChange('ui.spacingScale', +e.target.value));
      }
      if (si) {
        (si)?.addEventListener('input', e => {
          const v = document.getElementById('uiShadowIntensityValue');
          if (v) v.textContent = `${e.target.value}%`;
        });
        (si)?.addEventListener('change', e => this.handleChange('ui.shadowIntensity', +e.target.value));
      }
      if (gi) {
        (gi)?.addEventListener('input', e => {
          const v = document.getElementById('uiGlowIntensityValue');
          if (v) v.textContent = `${e.target.value}%`;
        });
        (gi)?.addEventListener('change', e => this.handleChange('ui.glowIntensity', +e.target.value));
      }
      if (ga) (ga)?.addEventListener('change', e => this.handleChange('ui.gradientAccents', e.target.checked));
    } catch (err) {
      console.error('[UIAppearance] Attach listeners error:', err);
    }
  }

  handleChange(k, v) {
    this.as.save(k, v);
    this.applyStyles();
  }

  applyStyles() {
    try {
      const c = this.sm.get('ui') || {};
      const r = document.documentElement.style;
      if (c.primaryColor) r.setProperty('--primary', c.primaryColor);
      if (c.accentColor) r.setProperty('--accent', c.accentColor);
      if (c.backgroundColor) r.setProperty('--bg-app', c.backgroundColor);
      if (c.textColor) r.setProperty('--text-primary', c.textColor);
      if (c.borderColor)
        r.setProperty('--border-color', `rgba(${this.hexToRgb(c.borderColor)}, 0.12)`);
      if (c.glassBlur !== undefined) r.setProperty('--glass-blur', `${c.glassBlur}px`);
      if (c.cardOpacity !== undefined)
        r.setProperty('--bg-card', `rgba(15, 15, 15, ${c.cardOpacity / 100})`);
      if (c.animationSpeed !== undefined)
        r.setProperty('--transition-speed', `${c.animationSpeed}s`);
      if (c.easingCurve) r.setProperty('--ease-out', c.easingCurve);
      if (c.borderWidth !== undefined) r.setProperty('--border-width', `${c.borderWidth}px`);
      if (c.radiusScale !== undefined) {
        r.setProperty('--radius-sm', `${6 * c.radiusScale}px`);
        r.setProperty('--radius-md', `${12 * c.radiusScale}px`);
        r.setProperty('--radius-lg', `${24 * c.radiusScale}px`);
        r.setProperty('--radius-xl', `${32 * c.radiusScale}px`);
      }
      if (c.shadowIntensity !== undefined) {
        r.setProperty('--card-shadow', `0 16px 40px 0 rgba(0, 0, 0, ${c.shadowIntensity / 100})`);
      }
      if (c.glowIntensity !== undefined) {
        r.setProperty('--accent-glow', `rgba(0, 243, 255, ${c.glowIntensity / 100})`);
      }
      if (c.microInteractions === false) {
        r.setProperty('--transition-speed', '0s');
      }
    } catch (err) {
      console.error('[UIAppearance] Apply styles error:', err);
    }
  }

  hexToRgb(h) {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
}
