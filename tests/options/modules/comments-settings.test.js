import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentsSettings } from '../../../extension/options/modules/comments-settings.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
}));

import { qs } from '../../../extension/utils/shortcuts/dom.js';

describe('CommentsSettings', () => {
  let settingsManager;
  let autoSave;
  let commentsSettings;
  let mockElements = {};

  beforeEach(() => {
    mockElements = {};
    qs.mockImplementation(selector => {
      const id = selector.replace('#', '');
      if (!mockElements[id]) {
        mockElements[id] = {
          value: '',
          checked: false,
          type: 'text', // Default type
        };
      }
      return mockElements[id];
    });

    settingsManager = {
      get: vi.fn().mockReturnValue({}),
    };

    autoSave = {
      attachToAll: vi.fn(),
    };

    commentsSettings = new CommentsSettings(settingsManager, autoSave);
  });

  it('should initialize with default values', () => {
    commentsSettings.init();

    expect(qs).toHaveBeenCalledWith('#commentsEnabled');
    expect(mockElements['commentsEnabled'].checked).toBe(true); // Default true

    expect(qs).toHaveBeenCalledWith('#commentsLimit');
    expect(mockElements['commentsLimit'].value).toBe(20); // Default 20

    expect(autoSave.attachToAll).toHaveBeenCalled();
  });

  it('should initialize with provided values', () => {
    settingsManager.get.mockReturnValue({
      comments: {
        enabled: false,
        limit: 50,
        includeReplies: false,
        sortBy: 'newest',
        analyzeSentiment: false,
        filterSpam: false,
        showAuthorBadges: false,
        highlightPinned: false,
      },
    });

    commentsSettings.init();

    expect(mockElements['commentsEnabled'].checked).toBe(false);
    expect(mockElements['commentsLimit'].value).toBe(50);
    expect(mockElements['includeReplies'].checked).toBe(false);
    expect(mockElements['commentsSortBy'].value).toBe('newest');
    expect(mockElements['analyzeSentiment'].checked).toBe(false);
    expect(mockElements['filterSpam'].checked).toBe(false);
    expect(mockElements['showAuthorBadges'].checked).toBe(false);
    expect(mockElements['highlightPinned'].checked).toBe(false);
  });

  it('should attach auto-save to all fields', () => {
    commentsSettings.init();

    const expectedConfig = {
      commentsEnabled: { path: 'comments.enabled' },
      commentsLimit: { path: 'comments.limit', transform: expect.any(Function) },
      includeReplies: { path: 'comments.includeReplies' },
      commentsSortBy: { path: 'comments.sortBy' },
      analyzeSentiment: { path: 'comments.analyzeSentiment' },
      filterSpam: { path: 'comments.filterSpam' },
      showAuthorBadges: { path: 'comments.showAuthorBadges' },
      highlightPinned: { path: 'comments.highlightPinned' },
    };

    expect(autoSave.attachToAll).toHaveBeenCalledWith(expect.objectContaining(expectedConfig));
  });
});
