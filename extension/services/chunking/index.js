import { chunkText } from './text.js'
import { chunkSegments } from './segments.js'
export class ChunkingService {
    constructor() { this.defaultChunkSize = 20000; this.defaultOverlap = 500 }
    chunkText(t, s, o) { return chunkText(t, s || this.defaultChunkSize, o || this.defaultOverlap) }
    chunkSegments(segs, s) { return chunkSegments(segs, s || this.defaultChunkSize) }
}
