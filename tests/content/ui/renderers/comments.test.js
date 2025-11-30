import { renderComments } from '../../../../extension/content/ui/renderers/comments.js';

vi.mock('../../../../extension/utils/shortcuts/runtime.js', () => ({
  gu: vi.fn(p => p),
  rs: vi.fn(),
}));

vi.mock('../../../../extension/content/core/state.js', () => ({
  state: {},
}));

vi.mock('../../../../extension/content/ui/components/loading.js', () => ({
  showLoading: vi.fn(),
  showPlaceholder: vi.fn(),
}));

vi.mock('../../../../extension/content/handlers/comments.js', () => ({
  getComments: vi.fn(),
}));

vi.mock('../../../../extension/lib/marked-loader.js', () => ({
  parseMarkdown: vi.fn(t => Promise.resolve(t)),
}));

vi.mock('../../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts/global.js', () => ({
  to: vi.fn(cb => {
    if (cb) cb();
    return Promise.resolve();
  }),
}));

vi.mock('../../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../../extension/utils/shortcuts/core.js', () => ({
  mp: vi.fn(arr => arr.map),
}));

vi.mock('../../../../extension/utils/shortcuts/string.js', () => ({
  jn: vi.fn((arr, sep) => arr.join(sep)),
  slc: vi.fn((arr, start, end) => arr.slice(start, end)),
}));

vi.mock('../../../../extension/utils/shortcuts/dom.js', () => ({
  ce: vi.fn(tag => document.createElement(tag)),
  ap: vi.fn(),
  ih: vi.fn(),
  txt: vi.fn(),
  dc: {
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    documentElement: { scrollTop: 0 },
    body: { scrollTop: 0, offsetHeight: 1000 },
  },
}));

import { state } from '../../../../extension/content/core/state.js';
import {
  showLoading,
  showPlaceholder,
} from '../../../../extension/content/ui/components/loading.js';
import { getComments } from '../../../../extension/content/handlers/comments.js';
import { rs } from '../../../../extension/utils/shortcuts/runtime.js';
import { sg } from '../../../../extension/utils/shortcuts/storage.js';
import { ih } from '../../../../extension/utils/shortcuts/dom.js';

describe('renderComments', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    sg.mockResolvedValue({ config: {} });
    global.window = { scrollY: 100, scrollTo: vi.fn(), scrollBy: vi.fn() };
  });

  it('should render cached analysis if available', async () => {
    state.analysisData = { commentAnalysis: '# Analysis' };

    await renderComments(container);

    expect(ih).toHaveBeenCalledWith(
      container,
      expect.stringContaining('Comment Sentiment Analysis')
    );
    expect(ih).toHaveBeenCalledWith(container, expect.stringContaining('# Analysis'));
  });

  it('should show loading states', async () => {
    getComments.mockResolvedValue([]);

    await renderComments(container);

    expect(showLoading).toHaveBeenCalledWith(container, 'Loading comments section...');
    expect(showLoading).toHaveBeenCalledWith(container, 'Waiting for comments...');
  });

  it('should show placeholder when no comments found', async () => {
    getComments.mockResolvedValue([]);

    await renderComments(container);

    expect(showPlaceholder).toHaveBeenCalledWith(container, 'No comments found.');
  });

  it('should analyze comments and render results', async () => {
    const mockComments = [
      { id: 1, author: 'User1', text: 'Great!', likes: '10' },
      { id: 2, author: 'User2', text: 'Nice', likes: '5' },
    ];
    getComments.mockResolvedValue(mockComments);
    rs.mockResolvedValue({ success: true, analysis: 'Positive sentiment' });

    await renderComments(container);

    expect(getComments).toHaveBeenCalled();
    expect(rs).toHaveBeenCalledWith({
      action: 'ANALYZE_COMMENTS',
      comments: mockComments,
    });
    expect(ih).toHaveBeenCalledWith(container, expect.stringContaining('Positive sentiment'));
  });

  it('should handle analysis errors', async () => {
    getComments.mockRejectedValue(new Error('Failed to get comments'));

    await renderComments(container);

    expect(ih).toHaveBeenCalledWith(
      container,
      expect.stringContaining('Failed: Failed to get comments')
    );
  });
});
