import { prompts } from '../../../extension/api/prompts/index.js';

describe('prompts index', () => {
  it('should export all prompt generators', () => {
    expect(prompts).toHaveProperty('comments');
    expect(prompts).toHaveProperty('comprehensive');
    expect(prompts).toHaveProperty('segments');
    expect(prompts).toHaveProperty('chat');
    expect(typeof prompts.comments).toBe('function');
    expect(typeof prompts.comprehensive).toBe('function');
    expect(typeof prompts.segments).toBe('function');
    expect(typeof prompts.chat).toBe('function');
  });
});
