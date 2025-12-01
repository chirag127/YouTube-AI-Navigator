import { initTabs, switchTab } from '../../../../extension/content/ui/tabs.js';

vi.mock('../../../../extension/utils/shortcuts/runtime.js', () => ({
  gu: vi.fn(p => `mock-extension://${p}`),
}));

vi.mock('../../../../extension/content/core/state.js', () => ({
  state: { analysisData: {} },
}));

vi.mock('../../../../extension/content/ui/renderers/summary.js', () => ({
  renderSummary: vi.fn(),
}));

vi.mock('../../../../extension/content/ui/renderers/segments.js', () => ({
  renderSegments: vi.fn(),
}));

vi.mock('../../../../extension/content/ui/renderers/chat.js', () => ({
  renderChat: vi.fn(),
}));

vi.mock('../../../../extension/content/ui/renderers/comments.js', () => ({
  renderComments: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  qsa: vi.fn(),
  id: vi.fn(),
  on: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

import { renderSummary } from '../../../../extension/content/ui/renderers/summary.js';
import { renderSegments } from '../../../../extension/content/ui/renderers/segments.js';
import { renderChat } from '../../../../extension/content/ui/renderers/chat.js';
import { renderComments } from '../../../../extension/content/ui/renderers/comments.js';


describe('tabs', () => {
  let mockContainer;
  let mockTabs;
  let mockContentArea;
  let mockChatInputArea;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTabs = [
      { dataset: { tab: 'summary' }, classList: { remove: vi.fn(), add: vi.fn() } },
      { dataset: { tab: 'segments' }, classList: { remove: vi.fn(), add: vi.fn() } },
    ];

    mockContentArea = { innerHTML: '' };
    mockChatInputArea = { style: { display: '' } };
    mockContainer = {};

    qsa.mockReturnValue(mockTabs);
    document.querySelector.mockImplementation(selector => {
      if (selector.includes('chat-input-area')) return mockChatInputArea;
      if (selector.includes('content-area')) return mockContentArea;
      if (selector.includes('[data-tab=')) return mockTabs[0];
      return null;
    });
    document.getElementById.mockReturnValue(mockContainer);
  });

  describe('initTabs', () => {
    it('should attach click listeners to tabs', () => {
      initTabs(mockContainer);

      expect(qsa).toHaveBeenCalledWith('.yt-ai-tab', mockContainer);
      expect(on).toHaveBeenCalledTimes(2);
    });
  });

  describe('switchTab', () => {
    it('should switch to summary tab', () => {
      switchTab('summary', mockContainer);

      expect(renderSummary).toHaveBeenCalledWith(mockContentArea, expect.any(Object));
      expect(mockChatInputArea.style.display).toBe('none');
    });

    it('should switch to segments tab', () => {
      switchTab('segments', mockContainer);

      expect(renderSegments).toHaveBeenCalledWith(mockContentArea, expect.any(Object));
    });

    it('should switch to chat tab and show input', () => {
      switchTab('chat', mockContainer);

      expect(renderChat).toHaveBeenCalledWith(mockContentArea);
      expect(mockChatInputArea.style.display).toBe('flex');
    });

    it('should switch to comments tab', () => {
      switchTab('comments', mockContainer);

      expect(renderComments).toHaveBeenCalledWith(mockContentArea);
    });

    it('should handle missing content area', () => {
      document.querySelector.mockImplementation(selector => {
        if (selector.includes('content-area')) return null;
        return mockChatInputArea;
      });

      switchTab('summary', mockContainer);

      expect(renderSummary).not.toHaveBeenCalled();
    });

    it('should handle render errors gracefully', () => {
      renderSummary.mockImplementation(() => {
        throw new Error('Render failed');
      });

      switchTab('summary', mockContainer);

      expect(mockContentArea.innerHTML).toContain('Error loading tab content');
    });

    it('should use provided container or default to master widget', () => {
      document.getElementById.mockReturnValue(mockContainer);

      switchTab('summary');

      expect(id).toHaveBeenCalledWith('yt-ai-master-widget');
    });
  });
});
