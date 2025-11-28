import { buildContextString } from "./utils.js";

export const segments = (context) => {
    const transcript =
        context.transcript && context.transcript.length > 0
            ? typeof context.transcript === "string"
                ? context.transcript
                : JSON.stringify(context.transcript)
            : "[]";

    return `
    Task: Segment transcript. Return raw JSON array.

    CRITICAL:
    1. Use SHORT keys.
    2. Descriptions MUST be concise summaries (max 15 words). NO raw transcript.
    3. Include timestamp range in description (e.g., "[00:00-00:30] Summary").

    Context:
    ${buildContextString(context)}

    Categories:
    - Sponsor
    - Unpaid/Self Promotion
    - Exclusive Access
    - Interaction Reminder (Subscribe)
    - Highlight (Max 1)
    - Intermission/Intro Animation
    - Endcards/Credits
    - Preview/Recap
    - Hook/Greetings
    - Tangents/Jokes
    - Content

    JSON Format:
    [{
        "s": number (start sec),
        "e": number (end sec, use ${
            context.metadata?.lengthSeconds || -1
        } if unknown),
        "l": "Category",
        "t": "Title (max 3 words)",
        "d": "[MM:SS] Concise Summary (max 15 words)"
    }]

    Transcript:
    ${transcript}
    `;
};
