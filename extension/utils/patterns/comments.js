export const sentimentPatterns = {
  positive: [
    /\b(?:amazing|awesome|great|excellent|fantastic|love|perfect|brilliant|outstanding|incredible)\b/gi,
    /\b(?:thank\s+you|thanks|appreciate|helpful|useful|informative)\b/gi,
    /👍|❤️|🔥|💯|😊|😍|🙌|👏/g,
  ],
  negative: [
    /\b(?:terrible|awful|horrible|worst|hate|disappointing|useless|waste|garbage|trash)\b/gi,
    /\b(?:dislike|boring|stupid|dumb|bad|poor|sucks)\b/gi,
    /👎|😡|😠|💩|🤮|😤/g,
  ],
  question: [
    /\?$/,
    /\b(?:how|what|why|when|where|who|can\s+(?:you|someone)|could\s+(?:you|someone))\b/gi,
  ],
  spam: [
    /\b(?:check\s+out\s+my|subscribe\s+to\s+my|visit\s+my|click\s+(?:here|link))\b/gi,
    /\b(?:free\s+(?:money|gift|download)|win\s+(?:money|prize)|make\s+money)\b/gi,
  ],
};
export const analyzeSentiment = t => {
  let pos = 0,
    neg = 0;
  sentimentPatterns.positive.forEach(p => {
    const m = t.match(p);
    if (m) pos += m.length;
  });
  sentimentPatterns.negative.forEach(p => {
    const m = t.match(p);
    if (m) neg += m.length;
  });
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
};
export const detectSpam = t => {
  for (const p of sentimentPatterns.spam) {
    if (p.test(t)) return true;
  }
  return false;
};
export const isQuestion = t => sentimentPatterns.question.some(p => p.test(t));
