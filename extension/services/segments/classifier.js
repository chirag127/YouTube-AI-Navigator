import { annotateTranscript } from './rule-engine.js';
import { isa } from '../../utils/shortcuts/array.js';
import { l, e } from '../../utils/shortcuts/log.js';

export async function classifyTranscript(context, g) {
  const { transcript, metadata } = context;
  if (!transcript || !transcript.length) {
    return [];
  }

  const annotatedTranscript = annotateTranscript(transcript, metadata);

  const annotatedContext = {
    ...context,
    transcript: annotatedTranscript,
  };

  try {
    const result = await g.extractSegments(annotatedContext);

    if (isa(result)) {
      return { segments: result, fullVideoLabel: null };
    }

    return {
      segments: result.segments || [],
      fullVideoLabel: result.fullVideoLabel || null,
    };
  } catch (err) {
    e('error:classifyTranscript', err);
    return { segments: [], fullVideoLabel: null };
  }
}




