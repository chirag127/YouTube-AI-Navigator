import { injectWidget, getWidget } from '../../../../extension/content/ui/widget.js';

vi.mock('../../../../extension/utils/shortcuts/runtime.js', () => ({
  gu: vi.fn(p => p),
}));

vi.mock('../../../../extension/utils/shortcuts/array.js', () => ({
  af: vi.fn(arr => Array.from(arr)),
}));

vi.mock('../../../../extension/content/utils/dom.js', () => ({
  findSecondaryColumn: vi.fn(),
  isWidgetProperlyVisible: vi.fn(),
}));

vi.mock('../../../../extension/content/ui/tabs.js', () => ({
  initTabs: vi.fn(),
}));

vi.mock('../../../../extension/content/handlers/events.js', () => ({
  attachEventListeners: vi.fn(),
}));

vi.mock('../../../../extension/content/ui/components/widget/structure.js', () => ({
  createWidgetHTML: vi.fn(() => '<div>Widget HTML</div>'),
}));

vi.mock('../../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  id: vi.fn(),
  on: vi.fn(),
  el: vi.fn(tag => document.createElement(tag)),
  wfe: vi.fn(),
  mo: vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
  log: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts/global.js', () => ({
  si: vi.fn(),
  ci: vi.fn(),
  to: vi.fn((cb, ms) => setTimeout(cb, ms)),
}));

vi.mock('../../../../extension/utils/shortcuts/core.js', () => ({
  log: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
  ss: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts.js', () => ({
  ael: vi.fn(),
  stc: vi.fn(),
  ih: vi.fn(),
}));

import { findSecondaryColumn } from '../../../../extension/content/utils/dom.js';
import { sg } from '../../../../extension/utils/shortcuts/storage.js';
import { id } from '../../../../extension/utils/shortcuts/dom.js';

describe('widget', () => {
  let mockSecondaryColumn;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSecondaryColumn = {
      insertBefore: vi.fn(),
      firstChild: null,
    };

    findSecondaryColumn.mockReturnValue(mockSecondaryColumn);
    id.mockReturnValue(null);
    sg.mockResolvedValue({ config: { widget: {} } });

    global.window = { innerHeight: 1000 };
  });

  describe('injectWidget', () => {
    it('should inject widget into secondary column', async () => {
      await injectWidget();

      expect(findSecondaryColumn).toHaveBeenCalled();
      expect(mockSecondaryColumn.insertBefore).toHaveBeenCalled();
    });

    it('should reuse existing widget if properly visible', async () => {
      const existingWidget = document.createElement('div');
      existingWidget.id = 'yt-ai-master-widget';
      id.mockReturnValue(existingWidget);

      const { isWidgetProperlyVisible } =
        await import('../../../../extension/content/utils/dom.js');
      isWidgetProperlyVisible.mockReturnValue(true);

      await injectWidget();

      expect(mockSecondaryColumn.insertBefore).not.toHaveBeenCalled();
    });

    it('should load widget config', async () => {
      sg.mockResolvedValue({
        config: {
          widget: {
            height: 600,
            resizable: true,
          },
        },
      });

      await injectWidget();

      expect(sg).toHaveBeenCalledWith('config');
    });
  });

  describe('getWidget', () => {
    it('should return null initially', () => {
      const widget = getWidget();
      expect(widget).toBeNull();
    });
  });
});
