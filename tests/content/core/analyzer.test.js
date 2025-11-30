vi.mock('../../../extension/content/features/analysis/index.js', () => ({
  startAnalysis: vi.fn(),
}));

import { startAnalysis } from '../../../extension/content/core/analyzer.js';

describe('analyzer', () => {
  it('should export startAnalysis', () => {
    expect(startAnalysis).toBeDefined();
    expect(typeof startAnalysis).toBe('function');
  });
});
