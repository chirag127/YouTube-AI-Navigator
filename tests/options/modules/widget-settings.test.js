import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetSettings } from '../../../extension/options/modules/widget-settings.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  __esModule: true,
  qs: vi.fn(),
  id: vi.fn(),
  ce: vi.fn(),
  on: vi.fn(),
}));

import { qs, id, ce, on } from '../../../extension/utils/shortcuts/dom.js';

describe('WidgetSettings', () => {
  let settingsManager;
  let notificationManager;
  let widgetSettings;
  let mockElements = {};

  beforeEach(() => {
    mockElements = {};
    const mockEl = selector => {
      const elId = selector.replace('#', '');
      if (!mockElements[elId]) {
        mockElements[elId] = {
          value: '',
          checked: false,
          type: 'text',
          addEventListener: vi.fn(),
          appendChild: vi.fn(),
        };
      }
      return mockElements[elId];
    };

    qs.mockImplementation(mockEl);
    id.mockImplementation(mockEl);
    ce.mockImplementation(() => ({
      className: '',
      innerHTML: '',
      appendChild: vi.fn(),
      addEventListener: vi.fn(),
    }));

    settingsManager = {
      get: vi.fn().mockReturnValue({}),
      set: vi.fn(),
      save: vi.fn(),
    };

    notificationManager = {
      success: vi.fn(),
      show: vi.fn(),
    };

    widgetSettings = new WidgetSettings(settingsManager, notificationManager);
  });

  it('should load settings correctly', () => {
    const mockWidgetSettings = {
      height: 600,
      minHeight: 250,
      maxHeight: 1000,
      width: 450,
      minWidth: 350,
      maxWidth: 750,
      resizable: false,
      resizableWidth: true,
      position: 'left',
      opacity: 80,
      blur: 10,
      scale: 90,
      dynamicHeight: false,
      viewportMargin: 30,
      tabs: {
        summary: false,
        segments: true,
        chat: false,
        comments: true,
      },
      defaultCollapsed: true,
      rememberState: false,
      segmentFilters: {
        sponsor: false,
        selfpromo: true,
      },
    };
    settingsManager.get.mockReturnValue(mockWidgetSettings);

    widgetSettings.init();

    expect(mockElements['widget-height'].value).toBe(600);
    expect(mockElements['widget-min-height'].value).toBe(250);
    expect(mockElements['widget-max-height'].value).toBe(1000);
    expect(mockElements['widget-width'].value).toBe(450);
    expect(mockElements['widget-min-width'].value).toBe(350);
    expect(mockElements['widget-max-width'].value).toBe(750);
    expect(mockElements['widget-resizable'].checked).toBe(false);
    expect(mockElements['widget-resizable-width'].checked).toBe(true);
    expect(mockElements['widget-position'].value).toBe('left');
    expect(mockElements['widget-opacity'].value).toBe(80);
    expect(mockElements['widget-blur'].value).toBe(10);
    expect(mockElements['widget-scale'].value).toBe(90);
    expect(mockElements['widget-dynamic-height'].checked).toBe(false);
    expect(mockElements['widget-viewport-margin'].value).toBe(30);
    expect(mockElements['widget-tab-summary'].checked).toBe(false);
    expect(mockElements['widget-tab-segments'].checked).toBe(true);
    expect(mockElements['widget-tab-chat'].checked).toBe(false);
    expect(mockElements['widget-tab-comments'].checked).toBe(true);
    expect(mockElements['widget-default-collapsed'].checked).toBe(true);
    expect(mockElements['widget-remember-state'].checked).toBe(false);
    expect(mockElements['widget-show-sponsor'].checked).toBe(false);
    expect(mockElements['widget-show-selfpromo'].checked).toBe(true);
  });

  it('should save settings on change', async () => {
    widgetSettings.init();

    // Helper to trigger change event via 'on' mock
    const triggerChange = (id, val, prop = 'value') => {
      const el = mockElements[id];
      el[prop] = val;
      // Find the call to 'on' for this element and 'change' event
      const call = on.mock.calls.find(c => c[0] === el && c[1] === 'change');
      if (call) {
        call[2]({ target: el });
      }
    };

    triggerChange('widget-height', '700');
    triggerChange('widget-resizable', true, 'checked');
    triggerChange('widget-tab-summary', true, 'checked');
    triggerChange('widget-show-sponsor', true, 'checked');

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(settingsManager.set).toHaveBeenCalledWith('widget.height', 700);
    expect(settingsManager.set).toHaveBeenCalledWith('widget.resizable', true);
    expect(settingsManager.set).toHaveBeenCalledWith('widget.tabs.summary', true);
    expect(settingsManager.set).toHaveBeenCalledWith('widget.segmentFilters', expect.objectContaining({
        sponsor: true,
    }));
    expect(settingsManager.save).toHaveBeenCalled();
  });
});
