import { comments } from '../../../extension/api/prompts/comments.js';
import { sg } from '../../../extension/utils/shortcuts/storage.js';

// Mock storage
jest.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: jest.fn(),
}));

// Mock utils
jest.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: jest.fn(),
}));

jest.mock('../../../extension/utils/patterns/comments.js', () => ({
  analyzeSentiment: jest.fn(() => 'positive'),
  detectSpam: jest.fn(() => false),
  isQuestion: jest.fn(() => false),
}));

describe('Comments Prompt Generator', () => {
  const mockComments = [
    { author: 'User1', text: 'Great video!', likes: 10 },
    { author: 'User2', text: 'Spam comment', likes: 0 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return empty string for empty comment list', async () => {
    const result = await comments([]);
    expect(result).toBe('');
  });

  test('should respect spam filtering setting', async () => {
    sg.mockResolvedValue({
      config: {
        comments: { filterSpam: true },
        prompts: { comments: {} },
      },
    });

    const { detectSpam } = require('../../../extension/utils/patterns/comments.js');
    detectSpam.mockImplementation(text => text === 'Spam comment');

    const result = await comments(mockComments);

    expect(result).toContain('Spam Filtered: 1');
    expect(result).not.toContain('User2: Spam comment');
  });

  test('should respect sentiment analysis setting', async () => {
    sg.mockResolvedValue({
      config: {
        comments: { analyzeSentiment: true },
        prompts: { comments: {} },
      },
    });

    const result = await comments(mockComments);

    expect(result).toContain('Sentiment Distribution');
    expect(result).toContain('[POSITIVE]');
  });

  test('should disable sentiment analysis when configured', async () => {
    sg.mockResolvedValue({
      config: {
        comments: { analyzeSentiment: false },
        prompts: { comments: {} },
      },
    });

    const result = await comments(mockComments);

    expect(result).toContain('Sentiment analysis disabled');
    expect(result).not.toContain('[POSITIVE]');
  });
});
