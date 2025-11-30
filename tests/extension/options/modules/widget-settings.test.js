import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetSettings } from '../../../../extension/options/modules/widget-settings.js';

describe('WidgetSettings', () => {
  let mockSM, mockNM, widgetSettings;

  beforeEach(() => {
    mockSM = {
      get: vi.fn(() => ({
        widget: {
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
        },
      })),
      set: vi.fn(),
      save: vi.fn(),
    };
    mockNM = {
      show: vi.fn(),
    };
    widgetSettings = new WidgetSettings(mockSM, mockNM);
  });

  it('should initialize correctly', () => {
    widgetSettings.init();
    expect(mockSM.get).toHaveBeenCalledWith('widget');
  });

  it('should load settings', () => {
    widgetSettings.loadSettings();
    expect(mockSM.get).toHaveBeenCalledWith('widget');
  });

  it('should save settings', async () => {
    await widgetSettings.save();
    expect(mockSM.save).toHaveBeenCalled();
    expect(mockNM.show).toHaveBeenCalledWith('Widget settings saved', 'success');
  });

  it('should reset settings', async () => {
    await widgetSettings.reset();
    expect(mockSM.set).toHaveBeenCalledWith('widget', expect.any(Object));
    expect(mockSM.save).toHaveBeenCalled();
    expect(mockNM.show).toHaveBeenCalledWith('Widget settings reset to defaults', 'success');
  });

  it('should handle network failure in save', async () => {
    mockSM.save.mockRejectedValue(new Error('Network error'));
    await expect(widgetSettings.save()).rejects.toThrow('Network error');
    expect(mockNM.show).toHaveBeenCalledWith('Failed to save widget settings', 'error');
  });

  it('should handle empty config', () => {
    mockSM.get.mockReturnValue({});
    widgetSettings.loadSettings();
    expect(mockSM.get).toHaveBeenCalled();
  });

  it('should handle boundary values', () => {
    mockSM.get.mockReturnValue({
      widget: {
        height: 0,
        minHeight: 0,
        maxHeight: 0,
        width: 0,
        minWidth: 0,
        maxWidth: 0,
        opacity: 0,
        blur: 0,
        scale: 0,
        viewportMargin: 0,
        borderRadius: 0,
      },
    });
    widgetSettings.loadSettings();
  });
});
