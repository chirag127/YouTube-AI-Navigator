export const prompts = {
    summary: (transcript, options) => {
        const { metadata, lyrics } = options;

        let titleContext = `Original Title: ${
            metadata?.originalTitle || metadata?.title || "Unknown"
        }`;
        if (metadata?.deArrowTitle) {
            titleContext += `\nCommunity Title (DeArrow): ${metadata.deArrowTitle}`;
        }

        const contextInfo = `
        Video Context:
        ${titleContext}
        Channel: ${metadata?.author || "Unknown"}
        Description: ${metadata?.description || "N/A"}
        ${
            lyrics
                ? `\nLyrics Source: ${lyrics.source}\nLyrics:\n${lyrics.lyrics}\n`
                : ""
        }
        `;

        return `
        Role: You are an expert video summarizer.
        Task: Create a concise summary of the following video transcript.

        Context:
        ${contextInfo}

        Constraints:
        - Length: ${options.length || "Medium"}
        - Language: ${options.language || "English"}
        - Format: Markdown

        Transcript:
        ${transcript}
        `;
    },

    chat: (question, context, metadata) => {
        let titleContext = `Original Title: ${
            metadata?.originalTitle || metadata?.title || "Unknown"
        }`;
        if (metadata?.deArrowTitle) {
            titleContext += `\nCommunity Title (DeArrow): ${metadata.deArrowTitle}`;
        }

        return `
        Role: You are a helpful AI assistant for a YouTube video.

        Context:
        ${titleContext}
        Channel: ${metadata?.author || "Unknown"}

        Video Transcript Context: ${context}

        User Question: ${question}

        Instructions:
        - Answer based ONLY on the video context provided.
        - Be concise and helpful.
        - If the answer is not in the video, state that clearly.
        `;
    },

    comments: (comments) => {
        const commentText = comments
            .map((c) => `- ${c.authorText}: ${c.textDisplay}`)
            .join("\n");
        return `
        Task: Analyze the sentiment and key themes of these YouTube comments.

        Comments:
        ${commentText}

        Output Format (Markdown):
        ### Sentiment Overview
        (Positive/Negative/Neutral mix)

        ### Key Themes
        - Theme 1
        - Theme 2

        ### Controversial Topics (if any)
        `;
    },

    faq: (transcript, metadata) => {
        let titleContext = `Original Title: ${
            metadata?.originalTitle || metadata?.title || "Unknown"
        }`;
        if (metadata?.deArrowTitle) {
            titleContext += `\nCommunity Title (DeArrow): ${metadata.deArrowTitle}`;
        }

        return `
        Task: Generate 5-7 Frequently Asked Questions (FAQ) that this video answers, along with their concise answers.

        Video Context:
        ${titleContext}
        Channel: ${metadata?.author || "Unknown"}

        Transcript:
        ${transcript}

        Format:
        - Highlight: The part of the video that most people are looking for. Similar to "Video starts at x" comments.
        - Intermission/Intro Animation: An interval without actual content. Could be a pause, static frame, repeating animation. This should not be used for transitions containing information.
        - Endcards/Credits: Credits or when the YouTube endcards appear. Not for conclusions with information.
        - Preview/Recap: Collection of clips that show what is coming up in in this video or other videos in a series where all information is repeated later in the video.
        - Hook/Greetings: Narrated trailers for the upcoming video, greetings and goodbyes. This should not skip conclusions with information.
        - Tangents/Jokes: Tangential scenes or jokes that are not required to understand the main content of the video. This should not include segments providing context or background details. This is a very aggressive category meant for when you aren't in the mood for "fun".
        - Content: The main video content.

        JSON Format:
        [
            {
                "start": number (seconds),
                "end": number,
                "label": "Category Name",
                "title": "Short descriptive title (max 5 words)",
                "description": "Detailed description of what happens in this segment",
                "importance": "High" | "Medium" | "Low"
            }
        ]

        Transcript:
        ${transcript}
        `;
    },

    comprehensive: (transcript, options) => {
        const { metadata, lyrics } = options;

        let titleContext = `Original Title: ${
            metadata?.originalTitle || metadata?.title || "Unknown"
        }`;
        if (metadata?.deArrowTitle) {
            titleContext += `\nCommunity Title (DeArrow): ${metadata.deArrowTitle}`;
        }

        const contextInfo = `
        Video Context:
        ${titleContext}
        Channel: ${metadata?.author || "Unknown"}
        Description: ${metadata?.description || "N/A"}
        ${
            lyrics
                ? `\nLyrics Source: ${lyrics.source}\nLyrics:\n${lyrics.lyrics}\n`
                : ""
        }
        `;

        return `
        Role: You are an advanced AI video analyst.
        Task: Provide a comprehensive analysis of this video.

        Context:
        ${contextInfo}

        Directives:
        1. **Summary**: A ${options.length || "Medium"} length summary.
        2. **Key Insights**: Bullet points of the most valuable takeaways.
        3. **Timestamps**: Include [MM:SS] timestamps references where appropriate.
        4. **FAQ**: 3-5 relevant Q&A pairs.

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
    },
};
