import { chunkText } from './text.js';
import { chunkSegments } from './segments.js';
import { l } from '../../utils/shortcuts/log.js';
export class ChunkingService {
  constructor() {
    this.defaultChunkSize = 500000;
    this.defaultOverlap = 1000;
    }
  chunkText(t, s, o) {
    const result = chunkText(t, s || this.defaultChunkSize, o || this.defaultOverlap);
    return result;
  }
  chunkSegments(segs, s) {
    const result = chunkSegments(segs, s || this.defaultChunkSize);
    return result;
  }
}




