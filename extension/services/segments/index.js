import { classifyTranscript } from "./classifier.js";
import { fillContentGaps } from "./gaps.js";
export class SegmentClassificationService {
    constructor(g, c) {
        this.gemini = g;
        this.chunking = c;
    }
    async classifyTranscript(t, metadata) {
        const c = await classifyTranscript(t, this.gemini, metadata);
        return fillContentGaps(c, t);
    }
}
