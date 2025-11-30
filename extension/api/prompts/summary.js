import { buildContextString } from './utils.js';

export const summary = (transcript, options) => {
  const context = {
    transcript,
    metadata: options.metadata || {},
    lyrics: options.lyrics,
    comments: [],
    sponsorBlockSegments: options.sponsorBlockSegments,
  };

  return `
    Role: You are an expert video summarizer.
    Task: Create a concise summary of the following video transcript.

    Context:
    ${buildContextString(context)}

    Instructions:
    - Use the provided SponsorBlock segments (VERIFIED GROUND TRUTH) to identify and EXCLUDE sponsors, self-promotion, and interaction reminders from the summary.
    - Focus ONLY on the main content.

    Constraints:
    - Length: ${options.length || 'Medium'}
    - Language: ${options.language || 'English'}
    - Format: Markdown

    Transcript:
    ${transcript}
    `;
};




