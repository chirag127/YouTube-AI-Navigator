import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UIAppearance } from '../../../../extension/options/modules/ui-appearance.js';

describe('UIAppearance', () => {
  let mockSM, mockAS, uiAppearance;

  beforeEach(() => {
    mockSM = {
      get: vi.fn(() => ({
        ui: {
          fontFamily: 'Inter',
          iconStyle: 'default',
          wallpaperMode: false,
          compactMode: false,
          primaryColor: '#00f3ff',
          accentColor: '#bc13fe',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          borderColor: '#ffffff',
          glassBlur: 32,
          cardOpacity: 60,
          animationSpeed: 0.2,
          easingCurve: 'cubic-bezier(0.4, 0, 0.2, 1)',
          microInteractions: true,
          borderWidth: 2,
          radiusScale: 1,
          spacingScale: 1,
          shadowIntensity: 60,
          glowIntensity: 40,
          gradientAccents: true,
        },
      })),
    };
    mockAS = {
      save: vi.fn(),
    };
    uiAppearance = new UIAppearance(mockSM, mockAS);
  });

  it('should initialize correctly', () => {
    uiAppearance.init();
    expect(mockSM.get).toHaveBeenCalledWith('ui');
  });

  it('should load settings', () => {
    uiAppearance.loadSettings();
    expect(mockSM.get).toHaveBeenCalledWith('ui');
  });

  it('should handle change', () => {
    uiAppearance.handleChange('ui.fontFamily', 'Arial');
    expect(mockAS.save).toHaveBeenCalledWith('ui.fontFamily', 'Arial');
  });

  it('should apply styles', () => {
    uiAppearance.applyStyles();
    // Check if document.documentElement.style.setProperty is called
  });

  it('should handle network failure in loadSettings', () => {
    mockSM.get.mockImplementation(() => {
      throw new Error('Network error');
    });
    expect(() => uiAppearance.loadSettings()).not.toThrow();
  });

  it('should handle empty config', () => {
    mockSM.get.mockReturnValue({});
    uiAppearance.loadSettings();
    expect(mockSM.get).toHaveBeenCalled();
  });

  it('should handle boundary values', () => {
    mockSM.get.mockReturnValue({
      ui: {
        glassBlur: 0,
        cardOpacity: 0,
        animationSpeed: 0,
        borderWidth: 0,
        radiusScale: 0,
        shadowIntensity: 0,
        glowIntensity: 0,
      },
    });
    uiAppearance.loadSettings();
    uiAppearance.applyStyles();
  });
});
