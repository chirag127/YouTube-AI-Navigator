import { classifyTranscript } from './classifier.js'
import { fillContentGaps } from './gaps.js'
export class SegmentClassificationService {
    constructor(g, c) { this.gemini = g; this.chunking = c }
    async classifyTranscript(t) {
        const c = await classifyTranscript(t, this.gemini)
        return fillContentGaps(c, t)
    }
}
