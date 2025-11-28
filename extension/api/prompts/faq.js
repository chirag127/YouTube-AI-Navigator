import { buildContextString } from "./utils.js";

export const faq = (transcript, metadata) => {
    const context = {
        transcript,
        metadata,
        comments: [],
        lyrics: null,
        sponsorBlockSegments: metadata?.sponsorBlockSegments || [],
    };

    return `
    Task: Generate 5-7 Frequently Asked Questions (FAQ) that this video answers, along with their concise answers.

    Instructions:
    - Use SponsorBlock segments (VERIFIED GROUND TRUTH) to ensure answers are accurate and relevant to the actual content (excluding sponsors).
    - If a question relates to a sponsored segment, clarify that it is a sponsor.

    ${buildContextString(context)}

    Transcript:
    ${transcript}
    `;
};
