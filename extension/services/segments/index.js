import { classifyTranscript } from './classifier.js';
import { fillContentGaps } from './gaps.js';
import { l } from '../../utils/shortcuts/log.js';
export class SegmentClassificationService {
  constructor(g, c) {
    this.gemini = g;
    this.chunking = c;
    }
  async classifyTranscript(context) {
    const result = await classifyTranscript(context, this.gemini);
    const filledSegments = fillContentGaps(result.segments, context.transcript);

    return {
      segments: filledSegments,
      fullVideoLabel: result.fullVideoLabel,
    };
  }
}




