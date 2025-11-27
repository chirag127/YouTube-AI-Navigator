export const prompts = {
    summary: (t, o) => {
        const { length = 'Medium', language = 'English', metadata = null } = o
        let l = ''
        switch (length) {
            case 'Short': l = 'Provide a short summary with bullet points (approx. 100 words).'; break
            case 'Detailed': l = 'Provide a comprehensive, detailed summary (approx. 600 words).'; break
            default: l = 'Provide a standard summary with paragraphs (approx. 300 words).'
        }

        let metadataContext = ''
        if (metadata) {
            metadataContext = '\nVIDEO METADATA:\n'
            if (metadata.title) metadataContext += `Title: ${metadata.title}\n`
            if (metadata.author) metadataContext += `Channel: ${metadata.author}\n`
            if (metadata.description) metadataContext += `Description: ${metadata.description}\n`
            if (metadata.category) metadataContext += `Category: ${metadata.category}\n`
            if (metadata.keywords?.length) metadataContext += `Keywords: ${metadata.keywords.join(', ')}\n`
            metadataContext += '\n'
        }

        return `Summarize the following video transcript.\n\nTarget Language: ${language}\nLength/Style: ${l}\n${metadataContext}Transcript:\n${t}`
    },
    comprehensive: (t, o) => {
        const { length = 'Medium', language = 'English', metadata = null } = o
        let l = ''
        switch (length) {
            case 'Short': l = 'Short summary with bullet points (approx. 100 words)'; break
            case 'Detailed': l = 'Comprehensive, detailed summary (approx. 600 words)'; break
            default: l = 'Standard summary with paragraphs (approx. 300 words)'
        }

        let metadataContext = ''
        if (metadata) {
            metadataContext = '\nVIDEO METADATA:\n'
            if (metadata.title) metadataContext += `Title: ${metadata.title}\n`
            if (metadata.author) metadataContext += `Channel: ${metadata.author}\n`
            if (metadata.description) metadataContext += `Description: ${metadata.description}\n`
            if (metadata.category) metadataContext += `Category: ${metadata.category}\n`
            if (metadata.keywords?.length) metadataContext += `Keywords: ${metadata.keywords.join(', ')}\n`
            metadataContext += '\n'
        }

        return `Analyze the following video transcript and provide a comprehensive output in JSON format.\nTarget Language: ${language}\n${metadataContext}\nRequired JSON Structure:\n{\n"summary": "Markdown formatted summary. ${l}",\n"faq": "Markdown formatted list of 5 Frequently Asked Questions and answers",\n"insights": "Markdown formatted key insights, trends, or interesting points",\n"keyDiscussionPoints": "Markdown formatted main themes and discussion points from the video",\n"comments": "Markdown formatted analysis of what viewers might discuss or comment about"\n}\n\nUse the video title, description, and keywords to provide better context and more accurate analysis.\n\nTranscript:\n${t}`
    },
    segments: (t) => `Analyze transcript and classify segments. Return ONLY valid JSON array.

CATEGORIES (STRICT):
1. Sponsor - Paid promotions, ad reads, product placements
2. Interaction Reminder - "Like, Subscribe, Hit the Bell" requests
3. Self Promotion - Creator's merch, courses, Patreon
4. Unpaid Promotion - Shout-outs to friends/charities
5. Highlight - Core value moment of video (ONLY ONE PER VIDEO)
6. Preview/Recap - "Coming up" teasers or "Previously on" recaps
7. Hook/Greetings - Generic intros/outros
8. Tangents/Jokes - Off-topic or entertainment filler

CRITICAL RULES:
- There can be ONLY ONE "Highlight" segment per video (the absolute peak moment)
- Highlight has ONE timestamp (start only): {"label":"Highlight","start":120.5,"description":"..."}
- ALL other segments have TWO timestamps (start + end): {"label":"Sponsor","start":10.5,"end":45.2,"description":"..."}
- Both start and end timestamps MUST be clickable in the UI to allow users to jump to segment boundaries
- If the ENTIRE video is about a product, use a "Full Video Label" instead of Sponsor
- Only include segments you can clearly identify - NO generic "Content" segments

JSON FORMAT:
[{"label":"Sponsor","start":10.5,"end":45.2,"description":"Brief desc"},{"label":"Highlight","start":120.5,"description":"Main point"}]

Transcript has [timestamp] markers. Extract start/end from these.

${t}`,
    chat: (q, c, metadata = null) => {
        let metadataContext = ''
        if (metadata) {
            metadataContext = '\nVIDEO INFORMATION:\n'
            if (metadata.title) metadataContext += `Title: ${metadata.title}\n`
            if (metadata.author) metadataContext += `Channel: ${metadata.author}\n`
            if (metadata.description) metadataContext += `Description: ${metadata.description}\n`
            metadataContext += '\n'
        }

        return `You are a helpful assistant answering questions about a video. Use the following context to answer the question.\n${metadataContext}Context:\n${c}\n\nQuestion: ${q}`
    },
    comments: (c) => { const t = c.map((x, i) => `${i + 1}. ${x}`).join('\n'); return `Analyze the sentiment of these YouTube comments. Provide a summary of the general audience reaction, top recurring themes, and overall sentiment (Positive/Negative/Neutral).\n\nComments:\n${t}` },
    faq: (t, metadata = null) => {
        let metadataContext = ''
        if (metadata) {
            metadataContext = '\nVIDEO METADATA:\n'
            if (metadata.title) metadataContext += `Title: ${metadata.title}\n`
            if (metadata.author) metadataContext += `Channel: ${metadata.author}\n`
            if (metadata.description) metadataContext += `Description: ${metadata.description}\n`
            metadataContext += '\n'
        }

        return `Based on the following video transcript, generate a list of 5 Frequently Asked Questions (FAQs) and their answers. Format as a Markdown list.\n${metadataContext}Use the video title and description to generate more relevant FAQs.\n\nTranscript:\n${t}`
    }
}
