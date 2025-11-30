import { ChunkingService } from '../../../extension/services/chunking/index.js';

vi.mock('../../../extension/services/chunking/text.js', () => ({
  chunkText: vi.fn((text, chunkSize) => [
    { text: text.substring(0, chunkSize), start: 0, end: chunkSize },
  ]),
}));

vi.mock('../../../extension/services/chunking/segments.js', () => ({
  chunkSegments: vi.fn(segments => [[...segments]]),
}));

import { chunkText } from '../../../extension/services/chunking/text.js';
import { chunkSegments } from '../../../extension/services/chunking/segments.js';

describe('ChunkingService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChunkingService();
  });

  it('should initialize with default values', () => {
    expect(service.defaultChunkSize).toBe(500000);
    expect(service.defaultOverlap).toBe(1000);
  });

  it('should chunk text with custom size', () => {
    const text = 'x'.repeat(1000);
    service.chunkText(text, 100, 10);

    expect(chunkText).toHaveBeenCalledWith(text, 100, 10);
  });

  it('should chunk text with default size', () => {
    const text = 'test text';
    service.chunkText(text);

    expect(chunkText).toHaveBeenCalledWith(text, 500000, 1000);
  });

  it('should chunk segments with custom size', () => {
    const segments = [{ start: 0, end: 10 }];
    service.chunkSegments(segments, 1000);

    expect(chunkSegments).toHaveBeenCalledWith(segments, 1000);
  });

  it('should chunk segments with default size', () => {
    const segments = [{ start: 0, end: 10 }];
    service.chunkSegments(segments);

    expect(chunkSegments).toHaveBeenCalledWith(segments, 500000);
  });
});
