import { annotateTranscript } from "./rule-engine.js";

export async function classifyTranscript(context, g) {
    const { transcript, metadata } = context;
    if (!transcript || !transcript.length) return [];

    const annotatedTranscript = annotateTranscript(transcript, metadata);

    // Create a new context with the annotated transcript string
    const annotatedContext = {
        ...context,
        transcript: annotatedTranscript,
    };

    try {
        const e = await g.extractSegments(annotatedContext);

        return e || [];
    } catch (e) {
        return [];
    }
}
