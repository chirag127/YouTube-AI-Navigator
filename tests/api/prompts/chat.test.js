import { chat } from '../../../extension/api/prompts/chat.js';

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  sg: vi.fn(),
}));

vi.mock('../../../extension/utils/patterns/index.js', () => ({
  analyzeTranscript: vi.fn(),
  buildPatternHints: vi.fn(),
}));


import { analyzeTranscript, buildPatternHints } from '../../../extension/utils/patterns/index.js';

describe('chat prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sg.mockResolvedValue({ config: { prompts: { chat: {} } } });
    analyzeTranscript.mockReturnValue({});
    buildPatternHints.mockReturnValue('');
  });

  it('should generate prompt with basic context', async () => {
    const context = {
      metadata: { title: 'Test Video', author: 'Test Channel' },
      transcript: 'Test transcript',
    };
    const result = await chat('What is this about?', context);
    expect(result).toContain('Test Video');
    expect(result).toContain('Test Channel');
    expect(result).toContain('What is this about');
  });

  it('should include description when available', async () => {
    const context = {
      metadata: { title: 'Test', author: 'Author', description: 'x'.repeat(600) },
      transcript: '',
    };
    const result = await chat('question', context);
    expect(result).toContain('Description:');
    expect(result.match(/x{500}/)).toBeTruthy();
  });

  it('should include sponsorblock segments', async () => {
    const context = {
      metadata: { title: 'Test' },
      sponsorBlockSegments: [{ category: 'sponsor', start: 60, end: 120 }],
      transcript: '',
    };
    const result = await chat('q', context);
    expect(result).toContain('SponsorBlock Segments');
    expect(result).toContain('[sponsor]');
    expect(result).toContain('1:00');
    expect(result).toContain('2:00');
  });

  it('should handle pattern hints when enabled', async () => {
    sg.mockResolvedValue({ config: { prompts: { chat: { enablePatternHints: true } } } });
    analyzeTranscript.mockReturnValue({ sponsor: true });
    buildPatternHints.mockReturnValue('Sponsor detected');
    const context = { metadata: { title: 'Test' }, transcript: 'test' };
    const result = await chat('q', context);
    expect(analyzeTranscript).toHaveBeenCalledWith('test');
    expect(buildPatternHints).toHaveBeenCalledWith({ sponsor: true });
    expect(result).toContain('Sponsor detected');
  });

  it('should disable pattern hints when configured', async () => {
    sg.mockResolvedValue({ config: { prompts: { chat: { enablePatternHints: false } } } });
    const context = { metadata: { title: 'Test' }, transcript: 'test' };
    const result = await chat('q', context);
    expect(analyzeTranscript).not.toHaveBeenCalled();
    expect(result).not.toContain('PATTERN DETECTION');
  });
});
