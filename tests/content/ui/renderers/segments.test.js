// Mock runtime first to control gu output
vi.mock('../../../../extension/utils/shortcuts/runtime.js', () => ({
  gu: path => {
    // Map abstract paths to relative paths from segments.js (extension/content/ui/renderers/segments.js)
    const mapping = {
      'utils/shortcuts/log.js': '../../../utils/shortcuts/log.js',
      'content/ui/components/loading.js': '../components/loading.js',
      'content/utils/dom.js': '../../utils/dom.js',
      'content/utils/time.js': '../../utils/time.js',
      'utils/shortcuts/dom.js': '../../../utils/shortcuts/dom.js',
      'utils/shortcuts/segments.js': '../../../utils/shortcuts/segments.js',
      'utils/shortcuts/storage.js': '../../../utils/shortcuts/storage.js',
    };
    return mapping[path] || path;
  },
}));

// Mock the modules using paths relative to THIS test file (tests/content/ui/renderers/segments.test.js)
// These must point to the same files that segments.js imports
vi.mock('../../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../../extension/content/ui/components/loading.js', () => ({
  showPlaceholder: (c, msg) => {
    c.innerHTML = `<div class="placeholder">${msg}</div>`;
  },
}));

vi.mock('../../../../extension/content/utils/dom.js', () => ({
  seekVideo: vi.fn(),
}));

vi.mock('../../../../extension/content/utils/time.js', () => ({
  formatTime: t => `${t}s`,
}));

vi.mock('../../../../extension/utils/shortcuts/dom.js', () => ({
  qs: sel => document.querySelector(sel),
  ae: (el, evt, cb) => el.addEventListener(evt, cb),
  qsa: (sel, ctx) => (ctx || document).querySelectorAll(sel),
}));

vi.mock('../../../../extension/utils/shortcuts/segments.js', () => ({
  CM: { Sponsor: '#ff0000', Intro: '#00ff00' },
  LM: { Sponsor: 'Sponsor Segment', Intro: 'Introduction' },
}));

vi.mock('../../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi
    .fn()
    .mockResolvedValue({ config: { widget: { segmentFilters: { sponsor: true, intro: false } } } }),
}));

// Mock static imports
vi.mock('../../../../extension/utils/shortcuts/array.js', () => ({
  isa: arr => Array.isArray(arr),
}));

// Import the module under test AFTER mocking dependencies
import { renderSegments } from '../../../../extension/content/ui/renderers/segments.js';

describe('Segments Renderer', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '<div id="yt-ai-full-video-label"></div>';
    vi.clearAllMocks();
  });

  it('should render segments correctly', async () => {
    const data = {
      segments: [{ label: 'Sponsor', start: 0, end: 10, title: 'Ad', description: 'Buy this' }],
    };

    await renderSegments(container, data);

    const items = container.querySelectorAll('.yt-ai-segment-item');
    expect(items.length).toBe(1);
    expect(items[0].querySelector('.yt-ai-segment-label').textContent).toBe('Sponsor Segment');
    expect(items[0].querySelector('.yt-ai-segment-title').textContent).toBe('Ad');
  });

  it('should filter out disabled segments', async () => {
    const data = {
      segments: [
        { label: 'Sponsor', start: 0, end: 10 }, // Enabled in mock
        { label: 'HookGreetings', start: 10, end: 20 }, // Mapped to 'intro', disabled in mock
      ],
    };

    await renderSegments(container, data);

    const items = container.querySelectorAll('.yt-ai-segment-item');
    expect(items.length).toBe(1);
    expect(items[0].querySelector('.yt-ai-segment-label').textContent).toBe('Sponsor Segment');
  });

  it('should show placeholder if no segments match filter', async () => {
    const data = {
      segments: [
        { label: 'HookGreetings', start: 10, end: 20 }, // Disabled
      ],
    };

    await renderSegments(container, data);

    expect(container.innerHTML).toContain('No segments match your filter settings');
  });

  it('should handle click on timestamp', async () => {
    const { seekVideo } = await import('../../../../extension/content/utils/dom.js');

    const data = {
      segments: [{ label: 'Sponsor', start: 5, end: 10 }],
    };

    await renderSegments(container, data);

    const timestamp = container.querySelector('.yt-ai-timestamp');
    timestamp.click();

    expect(seekVideo).toHaveBeenCalledWith(5);
  });

  it('should update full video label if present', async () => {
    const data = {
      segments: [],
      fullVideoLabel: 'Sponsor',
    };

    await renderSegments(container, data);

    const label = document.querySelector('#yt-ai-full-video-label');
    expect(label.textContent).toBe('Sponsor Segment');
    expect(label.style.display).toBe('inline-block');
  });
});
