import { annotateTranscript } from './rule-engine.js';



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

    if (Array.isArray(result)) {
      return { segments: result, fullVideoLabel: null };
    }

    return {
      segments: result.segments || [],
      fullVideoLabel: result.fullVideoLabel || null,
    };
  } catch (err) {
    console.error('error:classifyTranscript', err);
    return { segments: [], fullVideoLabel: null };
  }
}
