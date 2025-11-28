import { buildContextString } from "./utils.js";

export const comprehensive = (context, options) => {
    const transcript =
        context.transcript && context.transcript.length > 0
            ? typeof context.transcript === "string"
                ? context.transcript
                : JSON.stringify(context.transcript)
            : "No transcript available. Please analyze based on the Context provided above (Metadata, Lyrics, Comments).";

    return `
    Role: You are an advanced AI video analyst.
    Task: Provide a comprehensive analysis of this video.

    Context:
    ${buildContextString(context)}

    Directives:
    1. **Summary**: A ${options.length || "Medium"} length summary.
    2. **Key Insights**: Bullet points of the most valuable takeaways.
    3. **Timestamps**: Include [MM:SS] timestamps references where appropriate.
    4. **FAQ**: 3-5 relevant Q&A pairs.
    5. **SponsorBlock**: Treat provided Community Segments as VERIFIED GROUND TRUTH. Exclude sponsors/self-promo from summary/insights unless relevant to the critique.

    Format (Markdown):
    ## Summary
    (Text with timestamps like [05:30])

    ## Key Insights
    - Insight 1
    - Insight 2

    ## FAQ
    **Q: ...**
    A: ...

    Transcript:
    ${transcript}
    `;
};
