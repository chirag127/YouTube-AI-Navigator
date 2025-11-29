// Highlight Classification Rule (ONE per video)
export const type = 'highlight';
export const description = 'Most important part of video (ONE timestamp only)';

export const detect = (text, context) => {
  // Detect based on title/thumbnail references
  const { title = '' } = context.metadata || {};
  const titleWords = title.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();
  const matches = titleWords.filter(w => w.length > 3 && textLower.includes(w));
  return matches.length >= 2;
};

export const validate = segments => {
  // Ensure ONLY ONE highlight exists
  const highlights = segments.filter(s => s.category === 'highlight');
  if (highlights.length > 1) {
    // Keep only the one with highest confidence
    highlights.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    highlights.slice(1).forEach(h => (h.category = 'content'));
  }
  return true;
};

export const isSingleTimestamp = true; // Only start timestamp, no end
