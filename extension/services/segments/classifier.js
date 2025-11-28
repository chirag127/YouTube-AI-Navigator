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
        const result = await g.extractSegments(annotatedContext);

        // Handle both new object format and potential legacy array format (though extractSegments now returns object)
        if (Array.isArray(result)) {
            return { segments: result, fullVideoLabel: null };
        }

        return {
            segments: result.segments || [],
            fullVideoLabel: result.fullVideoLabel || null,
        };
    } catch (e) {
        return { segments: [], fullVideoLabel: null };
    }
}
