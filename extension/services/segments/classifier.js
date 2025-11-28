import { annotateTranscript } from "./rule-engine.js";

export async function classifyTranscript(t, g, metadata) {
    if (!t || !t.length) return [];
    const f = annotateTranscript(t, metadata);
    try {
        const e = await g.extractSegments(f, null, metadata);
        return e;
    } catch (e) {
        return [];
    }
}
