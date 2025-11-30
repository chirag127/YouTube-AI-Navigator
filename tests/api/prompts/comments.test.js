import { describe, it, expect, vi } from 'vitest';
import { comments } from '../../../extension/api/prompts/comments.js';

// Mock dependencies
vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

vi.mock('../../../extension/utils/patterns/comments.js', () => ({
  analyzeSentiment: vi.fn(() => 'neutral'),
  detectSpam: vi.fn(() => false),
  isQuestion: vi.fn(() => false),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn().mockResolvedValue({
    config: {
      prompts: {
        comments: {
          minLikesForHighEngagement: 0,
        },
      },
    },
  }),
}));

describe('Comments Prompt', () => {
  it('should generate prompt with correct content from extractor data format', async () => {
    const mockComments = [
      {
        id: '1',
        author: 'User1', // Extractor format
        text: 'This is a comment', // Extractor format
        likes: '5',
      },
      {
        id: '2',
        authorText: 'User2', // Legacy/Fallback format
        textDisplay: 'Another comment', // Legacy/Fallback format
        likes: '10',
      },
    ];

    const result = await comments(mockComments);

    expect(result).toContain('User1: This is a comment');
    expect(result).toContain('User2: Another comment');
    expect(result).toContain('Min Likes for High Engagement: 0');
  });

  it('should handle empty list gracefully', async () => {
    const result = await comments([]);
    expect(result).toBe('');
  });
});
