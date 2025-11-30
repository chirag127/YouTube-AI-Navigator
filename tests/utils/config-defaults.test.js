import { describe, it, expect } from 'vitest';
import { DC } from '../../extension/utils/config.js';

describe('Config Defaults', () => {
  it('should have segments enabled by default', () => {
    expect(DC.sg.en).toBe(1);
  });

  it('should have auto-skip enabled by default', () => {
    expect(DC.sg.as).toBe(1);
  });

  it('should have comments enabled by default', () => {
    expect(DC.co.en).toBe(1);
  });

  it('should have aggressive segment actions by default', () => {
    expect(DC.sg.ct.sp.a).toBe('skip'); // Sponsor
    expect(DC.sg.ct.sf.a).toBe('skip'); // Self-promo
    expect(DC.sg.ct.in.a).toBe('skip'); // Intro
    expect(DC.sg.ct.ou.a).toBe('skip'); // Outro
  });
});
