import { comprehensive } from '../../../extension/api/prompts/comprehensive.js';

vi.mock('../../../extension/api/prompts/utils.js', () => ({
  buildContextString: vi.fn(ctx => `Context: ${ctx.metadata?.title || 'Unknown'}`),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
}));


import { buildContextString } from '../../../extension/api/prompts/utils.js';

describe('comprehensive prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sg.mockResolvedValue({ config: { prompts: { comprehensive: {} } } });
  });

  it('should generate comprehensive analysis prompt', async () => {
    const context = {
      metadata: { title: 'Test Video' },
      transcript: 'Test transcript content',
    };
    const result = await comprehensive(context);
    expect(result).toContain('Elite AI Video Analyst');
    expect(result).toContain('EXHAUSTIVE');
    expect(result).toContain('## Summary');
    expect(result).toContain('## Key Insights');
    expect(result).toContain('## FAQ');
    expect(buildContextString).toHaveBeenCalledWith(context);
  });

  it('should respect summaryLength option', async () => {
    const context = { metadata: { title: 'Test' }, transcript: 'test' };

    const short = await comprehensive(context, { summaryLength: 'short' });
    expect(short).toContain('3-5 detailed bullet points');

    const medium = await comprehensive(context, { summaryLength: 'medium' });
    expect(medium).toContain('8-12 comprehensive bullet points');

    const long = await comprehensive(context, { summaryLength: 'long' });
    expect(long).toContain('15-25 exhaustive bullet points');
  });

  it('should handle missing transcript', async () => {
    const context = { metadata: { title: 'Test' } };
    const result = await comprehensive(context);
    expect(result).toContain('No transcript available');
    expect(result).toContain('Metadata, Lyrics, Comments');
  });

  it('should allow disabling resources section', async () => {
    sg.mockResolvedValue({
      config: { prompts: { comprehensive: { includeResourcesSection: false } } },
    });
    const context = { metadata: { title: 'Test' }, transcript: 'test' };
    const result = await comprehensive(context);
    expect(result).not.toContain('## Additional Resources');
  });

  it('should allow disabling takeaways section', async () => {
    sg.mockResolvedValue({
      config: { prompts: { comprehensive: { includeActionableTakeaways: false } } },
    });
    const context = { metadata: { title: 'Test' }, transcript: 'test' };
    const result = await comprehensive(context);
    expect(result).not.toContain('## Actionable Takeaways');
  });

  it('should use custom role description', async () => {
    sg.mockResolvedValue({
      config: { prompts: { comprehensive: { roleDescription: 'Custom Role' } } },
    });
    const context = { metadata: { title: 'Test' }, transcript: 'test' };
    const result = await comprehensive(context);
    expect(result).toContain('Role: Custom Role');
  });

  it('should respect maxInsights, maxFAQ options', async () => {
    const context = { metadata: { title: 'Test' }, transcript: 'test' };
    const result = await comprehensive(context, { maxInsights: 20, maxFAQ: 15 });
    expect(result).toContain('Key Insights Target: 20+');
    expect(result).toContain('FAQ Target: 15+');
  });

  it('should handle includeTimestamps option', async () => {
    const context = { metadata: { title: 'Test' }, transcript: 'test' };

    const withTimestamps = await comprehensive(context, { includeTimestamps: true });
    expect(withTimestamps).toContain('MANDATORY [MM:SS]');

    const withoutTimestamps = await comprehensive(context, { includeTimestamps: false });
    expect(withoutTimestamps).toContain('Optional');
  });
});
