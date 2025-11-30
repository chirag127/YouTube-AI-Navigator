import { buildContextString } from '../../../extension/api/prompts/utils.js';

describe('prompt utilsbuil', () => {
  it('should build basic context string', () => {
    const context = {
      metadata: { title: 'Test Video', author: 'Test Channel', description: 'Test desc' },
    };
    const result = buildContextString(context);
    expect(result).toContain('Test Video');
    expect(result).toContain('Test Channel');
    expect(result).toContain('Test desc');
  });

  it('should include DeArrow title when available', () => {
    const context = {
      metadata: {
        title: 'Original',
        originalTitle: 'Original',
        deArrowTitle: 'Better Title',
      },
    };
    const result = buildContextString(context);
    expect(result).toContain('Original Title: Original');
    expect(result).toContain('Community Title (DeArrow): Better Title');
  });

  it('should include top comments', () => {
    const context = {
      metadata: { title: 'Test' },
      comments: [
        { author: 'User1', text: 'Great video', likes: '100' },
        { author: 'User2', text: 'Thanks', likes: '50' },
      ],
    };
    const result = buildContextString(context);
    expect(result).toContain('Top Comments:');
    expect(result).toContain('User1: Great video (Likes: 100)');
    expect(result).toContain('User2: Thanks (Likes: 50)');
  });

  it('should format sponsorblock segments', () => {
    const context = {
      metadata: { title: 'Test' },
      sponsorBlockSegments: [
        {
          category: 'sponsor',
          start: 65,
          end: 130,
          description: 'Sponsor spot',
          votes: 10,
          locked: true,
        },
      ],
    };
    const result = buildContextString(context);
    expect(result).toContain('SponsorBlock - VERIFIED GROUND TRUTH');
    expect(result).toContain('[sponsor]');
    expect(result).toContain('1:05');
    expect(result).toContain('2:10');
    expect(result).toContain('Sponsor spot');
    expect(result).toContain('10 votes');
    expect(result).toContain('locked');
  });

  it('should include external context', () => {
    const context = {
      metadata: { title: 'Test' },
      externalContext: {
        imdb: { rating: 8.5 },
        tmdb: { popularity: 100 },
      },
    };
    const result = buildContextString(context);
    expect(result).toContain('External Context');
    expect(result).toContain('IMDB');
    expect(result).toContain('TMDB');
    expect(result).toContain('8.5');
    expect(result).toContain('100');
  });

  it('should include lyrics when available', () => {
    const context = {
      metadata: { title: 'Song' },
      lyrics: { source: 'Genius', lyrics: 'La la la' },
    };
    const result = buildContextString(context);
    expect(result).toContain('Lyrics Source: Genius');
    expect(result).toContain('La la la');
  });

  it('should truncate long descriptions', () => {
    const context = {
      metadata: { title: 'Test', description: 'x'.repeat(1500) },
    };
    const result = buildContextString(context);
    expect(result).toContain('x'.repeat(1000));
    expect(result).toContain('...');
  });
});
