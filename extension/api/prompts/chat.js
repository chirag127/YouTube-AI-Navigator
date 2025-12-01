
import { analyzeTranscript, buildPatternHints } from '../../utils/patterns/index.js';

export const chat = async (question, context) => {
  const cfg = await chrome.storage.sync.get('config');
  const pCfg = cfg.config?.prompts?.chat || {};
  const hintsEnabled = pCfg.enablePatternHints !== false;

  const transcript =
    context.transcript && context.transcript.length > 0
      ? typeof context.transcript === 'string'
        ? context.transcript
        : JSON.stringify(context.transcript)
      : '';

  const patternMatches = hintsEnabled ? analyzeTranscript(transcript) : {};
  const hints = hintsEnabled ? buildPatternHints(patternMatches) : '';

  let contextStr = `Video: ${context.metadata?.title || 'Unknown'}\n`;
  contextStr += `Channel: ${context.metadata?.author || 'Unknown'}\n`;

  if (context.metadata?.description) {
    contextStr += `Description: ${context.metadata.description.substring(0, 500)}...\n`;
  }

  if (context.sponsorBlockSegments?.length) {
    contextStr += '\nSponsorBlock Segments (VERIFIED GROUND TRUTH):\n';
    context.sponsorBlockSegments.forEach(seg => {
      const st = Math.floor(seg.start / 60);
      const ss = Math.floor(seg.start % 60);
      const et = Math.floor(seg.end / 60);
      const es = Math.floor(seg.end % 60);
      contextStr += `- [${seg.category}] ${st}:${('00' + ss).slice(-2)} - ${et}:${('00' + es).slice(-2)}\n`;
    });
  }

  return `Role: AI assistant for YouTube video analysis with deep comprehension capabilities.

${contextStr}

${
  hintsEnabled
    ? `PATTERN DETECTION HINTS (Pre-Analyzed via Regex):
${hints || 'No patterns detected'}

`
    : ''
}User Question: ${question}

CRITICAL INSTRUCTIONS:
1. **Answer ONLY from video context** - Do not use external knowledge
2. **Reference timestamps [MM:SS]** when relevant to help user navigate
3. **SponsorBlock segments = VERIFIED GROUND TRUTH** - Trust these timings completely
4. **If answer not in video**, state clearly: "This information is not available in the video"
5. **Be specific and detailed** - Quote relevant parts of transcript when helpful
6. **Use pattern hints as guidance** - They indicate likely segment types but verify with context

${transcript ? `\nTranscript:\n${transcript}` : ''}`;
};
