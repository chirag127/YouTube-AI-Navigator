vi.mock('../../../extension/content/features/analysis/flow.js', () => ({
  startAnalysis: vi.fn(),
}));

import { startAnalysis } from '../../../extension/content/features/analysis/index.js';

describe('analysis index', () => {
  it('should export startAnalysis', () => {
    expect(startAnalysis).toBeDefined();
    expect(typeof startAnalysis).toBe('function');
  });
});
